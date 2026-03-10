import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const rootDir = process.cwd();
const postsRoot = path.join(rootDir, 'src', 'content', 'posts');

await loadEnvFile(path.join(rootDir, '.env.local'));
await loadEnvFile(path.join(rootDir, '.env'));

const config = await loadSyncConfig();
const configuredSources = (config.sources ?? []).filter((source) => source.enabled !== false);

if (configuredSources.length === 0) {
  console.log('No Feishu sync sources configured. Update feishu-sync.config.mjs to enable nightly sync.');
  process.exit(0);
}

const appId = process.env.FEISHU_APP_ID ?? '';
const appSecret = process.env.FEISHU_APP_SECRET ?? '';
const baseUrl = (process.env.FEISHU_OPEN_BASE_URL || 'https://open.feishu.cn').replace(/\/$/, '');

if (!appId || !appSecret) {
  throw new Error('Missing FEISHU_APP_ID or FEISHU_APP_SECRET. Add them to .env.local or GitHub Actions secrets.');
}

const accessToken = await getTenantAccessToken({ appId, appSecret, baseUrl });
const existingIndex = await buildExistingPostIndex(postsRoot);
const discoveredSources = await expandSources({
  sources: configuredSources,
  config,
  baseUrl,
  accessToken,
  existingIndex
});

const today = new Date().toISOString().slice(0, 10);
let changedCount = 0;

for (const source of discoveredSources) {
  const existing = source.existing ?? await readExistingPost(source.outputPath);
  const documentInfo = await getDocumentInfo({
    baseUrl,
    accessToken,
    documentToken: source.documentToken
  });
  const title = source.title || documentInfo.title || source.documentTitle || existing.frontmatter.title || startCase(source.pathSlug);
  const rawContent = await getDocumentRawContent({
    baseUrl,
    accessToken,
    documentToken: source.documentToken
  });
  const body = buildMarkdownBody(rawContent, title);
  const excerpt = source.excerpt || existing.frontmatter.excerpt || buildExcerpt(body, source.locale);

  const frontmatter = {
    pathSlug: source.pathSlug,
    locale: source.locale,
    translationKey: source.translationKey,
    title,
    excerpt,
    category: source.category,
    publishedAt: existing.frontmatter.publishedAt || source.publishedAt || today,
    updatedAt: today,
    featured: source.featured,
    tags: source.tags,
    accent: source.accent,
    heroEyebrow: source.heroEyebrow,
    sourcePlatform: 'feishu',
    sourceUrl: source.url,
    sourceDocToken: source.documentToken
  };

  const nextFile = `${stringifyFrontmatter(frontmatter)}\n\n${body}\n`;

  if (existing.content === nextFile) {
    console.log(`No changes for ${source.locale}/${source.pathSlug}`);
    continue;
  }

  await mkdir(path.dirname(source.outputPath), { recursive: true });
  await writeFile(source.outputPath, nextFile, 'utf8');
  changedCount += 1;
  console.log(`Updated ${path.relative(rootDir, source.outputPath)}`);
}

console.log(`Feishu sync complete. ${changedCount} file(s) updated.`);

async function expandSources({ sources, config, baseUrl, accessToken, existingIndex }) {
  const expanded = [];
  const reservedSlugs = cloneReservedSlugs(existingIndex.reservedSlugs);

  for (const source of sources) {
    if (isFolderSource(source)) {
      const folderSource = normalizeFolderSource(source, config);
      const folderToken = folderSource.folderToken ?? extractFolderToken(folderSource.url);

      if (!folderToken) {
        throw new Error(`Unable to resolve a Feishu folder token for ${folderSource.url}`);
      }

      const files = await listFolderDocuments({
        baseUrl,
        accessToken,
        folderToken,
        recursive: folderSource.recursive
      });

      console.log(`Discovered ${files.length} docx file(s) in folder ${folderSource.url}`);

      for (const file of files) {
        const key = `${folderSource.locale}:${file.token}`;
        const existing = existingIndex.byDocToken.get(key);
        const outputPath = existing?.filePath || '';
        const pathSlug = existing?.frontmatter.pathSlug || createUniquePathSlug({
          title: file.name,
          token: file.token,
          locale: folderSource.locale,
          reservedSlugs,
          strategy: folderSource.slugStrategy
        });

        reserveSlug(reservedSlugs, folderSource.locale, pathSlug);

        expanded.push({
          url: file.url || buildDocumentUrl(folderSource.url, file.token),
          locale: folderSource.locale,
          pathSlug,
          translationKey: existing?.frontmatter.translationKey || `${folderSource.translationKeyPrefix}${file.token}`,
          category: folderSource.category,
          tags: folderSource.tags,
          heroEyebrow: folderSource.heroEyebrow,
          accent: folderSource.accent,
          featured: folderSource.featured,
          publishedAt: folderSource.publishedAt,
          excerpt: folderSource.excerpt,
          title: folderSource.title,
          documentTitle: file.name,
          documentToken: file.token,
          outputPath: outputPath || path.join(postsRoot, folderSource.locale, `${pathSlug}.md`),
          existing
        });
      }

      continue;
    }

    const documentSource = normalizeDocumentSource(source, config, existingIndex);
    expanded.push(documentSource);
  }

  return expanded;
}

async function listFolderDocuments({ baseUrl, accessToken, folderToken, recursive }) {
  const queue = [folderToken];
  const visitedFolders = new Set();
  const documents = [];

  while (queue.length > 0) {
    const currentFolderToken = queue.shift();
    if (!currentFolderToken || visitedFolders.has(currentFolderToken)) continue;
    visitedFolders.add(currentFolderToken);

    let pageToken = '';

    while (true) {
      const params = new URLSearchParams({
        folder_token: currentFolderToken,
        page_size: '200'
      });
      if (pageToken) params.set('page_token', pageToken);

      const data = await fetchFeishuJson(`${baseUrl}/open-apis/drive/v1/files?${params.toString()}`, accessToken);
      const files = data.files ?? [];

      for (const file of files) {
        if (file.type === 'docx') {
          documents.push(file);
          continue;
        }

        if (recursive && file.type === 'folder') {
          queue.push(file.token);
        }
      }

      const hasMore = Boolean(data.has_more);
      pageToken = data.next_page_token ?? data.page_token ?? '';
      if (!hasMore || !pageToken) break;
    }
  }

  return documents;
}

function normalizeFolderSource(source, config) {
  if (!source.url) throw new Error('Each Feishu folder source needs a url.');
  if (!source.locale) throw new Error(`Missing locale for folder source ${source.url}`);

  return {
    url: source.url,
    locale: source.locale,
    recursive: source.recursive !== false,
    category: source.category || config.defaultCategory || 'Feishu Sync',
    tags: uniqueStrings(source.tags?.length ? source.tags : config.defaultTags || ['Feishu']),
    heroEyebrow: source.heroEyebrow || config.defaultHeroEyebrow || 'Feishu',
    accent: source.accent || config.defaultAccent || 'cyan',
    featured: Boolean(source.featured),
    publishedAt: source.publishedAt,
    title: source.title,
    excerpt: source.excerpt,
    folderToken: source.folderToken,
    slugStrategy: source.slugStrategy || 'title',
    translationKeyPrefix: source.translationKeyPrefix || 'feishu-'
  };
}

function normalizeDocumentSource(source, config, existingIndex) {
  if (!source.url) throw new Error('Each Feishu document source needs a url.');
  if (!source.locale) throw new Error(`Missing locale for source ${source.url}`);

  const documentToken = source.documentToken || extractDocumentToken(source.url);
  if (!documentToken) {
    throw new Error(`Unable to resolve a Feishu document token for ${source.url}. Use a /docx/ URL or set documentToken explicitly.`);
  }

  const existing = existingIndex.byDocToken.get(`${source.locale}:${documentToken}`) || null;
  const pathSlug = source.pathSlug || existing?.frontmatter.pathSlug;
  if (!pathSlug) {
    throw new Error(`Missing pathSlug for single-document source ${source.url}`);
  }

  return {
    url: source.url,
    locale: source.locale,
    pathSlug,
    translationKey: source.translationKey || existing?.frontmatter.translationKey || pathSlug,
    category: source.category || config.defaultCategory || 'Feishu Sync',
    tags: uniqueStrings(source.tags?.length ? source.tags : config.defaultTags || ['Feishu']),
    heroEyebrow: source.heroEyebrow || config.defaultHeroEyebrow || 'Feishu',
    accent: source.accent || config.defaultAccent || 'cyan',
    featured: Boolean(source.featured),
    publishedAt: source.publishedAt,
    title: source.title,
    excerpt: source.excerpt,
    documentToken,
    documentTitle: source.title,
    outputPath: existing?.filePath || path.join(postsRoot, source.locale, `${pathSlug}.md`),
    existing
  };
}

function isFolderSource(source) {
  return source.kind === 'folder' || /\/drive\/folder\//i.test(source.url || '');
}

function extractFolderToken(url) {
  const match = url.match(/\/drive\/folder\/([A-Za-z0-9]+)/i);
  return match?.[1] ?? '';
}

function extractDocumentToken(url) {
  const match = url.match(/\/docx\/([A-Za-z0-9]+)/i);
  return match?.[1] ?? '';
}

function buildDocumentUrl(folderUrl, documentToken) {
  try {
    const origin = new URL(folderUrl).origin;
    return `${origin}/docx/${documentToken}`;
  } catch {
    return `https://open.feishu.cn/docx/${documentToken}`;
  }
}

async function buildExistingPostIndex(rootPath) {
  const byDocToken = new Map();
  const reservedSlugs = new Map();

  for (const locale of ['zh', 'en']) {
    const localeDir = path.join(rootPath, locale);
    let files = [];
    try {
      files = await readdir(localeDir, { withFileTypes: true });
    } catch {
      reservedSlugs.set(locale, new Set());
      continue;
    }

    const localeSlugs = reservedSlugs.get(locale) || new Set();

    for (const file of files) {
      if (!file.isFile() || !/\.(md|mdx)$/i.test(file.name)) continue;
      const filePath = path.join(localeDir, file.name);
      const existing = await readExistingPost(filePath);
      const pathSlug = existing.frontmatter.pathSlug || file.name.replace(/\.(md|mdx)$/i, '');
      localeSlugs.add(pathSlug);
      if (existing.frontmatter.sourceDocToken) {
        byDocToken.set(`${locale}:${existing.frontmatter.sourceDocToken}`, {
          filePath,
          frontmatter: existing.frontmatter,
          content: existing.content
        });
      }
    }

    reservedSlugs.set(locale, localeSlugs);
  }

  return { byDocToken, reservedSlugs };
}

function cloneReservedSlugs(source) {
  const clone = new Map();
  for (const [locale, values] of source.entries()) clone.set(locale, new Set(values));
  return clone;
}

function reserveSlug(reservedSlugs, locale, slug) {
  const localeSet = reservedSlugs.get(locale) || new Set();
  localeSet.add(slug);
  reservedSlugs.set(locale, localeSet);
}

function createUniquePathSlug({ title, token, locale, reservedSlugs, strategy }) {
  const localeSet = reservedSlugs.get(locale) || new Set();
  const baseSlug = strategy === 'token'
    ? `feishu-${token.slice(0, 8).toLowerCase()}`
    : slugify(title) || `feishu-${token.slice(0, 8).toLowerCase()}`;

  let candidate = baseSlug;
  let index = 1;
  while (localeSet.has(candidate)) {
    candidate = `${baseSlug}-${index}`;
    index += 1;
  }
  return candidate;
}

function slugify(value) {
  return String(value)
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/["'`]/g, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

async function loadSyncConfig() {
  const filePath = path.join(rootDir, 'feishu-sync.config.mjs');
  const moduleUrl = `${pathToFileURL(filePath).href}?t=${Date.now()}`;
  const module = await import(moduleUrl);
  return module.default ?? { sources: [] };
}

async function loadEnvFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
      const index = line.indexOf('=');
      const key = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // optional file
  }
}

async function getTenantAccessToken({ appId, appSecret, baseUrl }) {
  const response = await fetch(`${baseUrl}/open-apis/auth/v3/tenant_access_token/internal`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
      app_id: appId,
      app_secret: appSecret
    })
  });

  const data = await response.json();

  if (!response.ok || data.code !== 0 || !data.tenant_access_token) {
    throw new Error(`Unable to get Feishu tenant access token: ${response.status} ${JSON.stringify(data)}`);
  }

  return data.tenant_access_token;
}

async function getDocumentInfo({ baseUrl, accessToken, documentToken }) {
  const data = await fetchFeishuJson(`${baseUrl}/open-apis/docx/v1/documents/${documentToken}`, accessToken);
  return data.document ?? {};
}

async function getDocumentRawContent({ baseUrl, accessToken, documentToken }) {
  const data = await fetchFeishuJson(`${baseUrl}/open-apis/docx/v1/documents/${documentToken}/raw_content`, accessToken);
  const content = data.content ?? '';
  if (!content.trim()) {
    throw new Error(`Feishu returned empty raw content for document ${documentToken}`);
  }
  return content;
}

async function fetchFeishuJson(url, accessToken) {
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json; charset=utf-8'
    }
  });

  const payload = await response.json();

  if (!response.ok || payload.code !== 0) {
    throw new Error(`Feishu request failed for ${url}: ${response.status} ${JSON.stringify(payload)}`);
  }

  return payload.data ?? {};
}

async function readExistingPost(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { content, frontmatter: {} };
    return { content, frontmatter: parseFrontmatter(match[1]) };
  } catch {
    return { content: '', frontmatter: {} };
  }
}

function parseFrontmatter(input) {
  const lines = input.split(/\r?\n/);
  const result = {};
  let currentArrayKey = '';

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, '  ');
    if (!line.trim()) continue;

    if (line.startsWith('  - ') && currentArrayKey) {
      result[currentArrayKey].push(stripQuotes(line.slice(4).trim()));
      continue;
    }

    const index = line.indexOf(':');
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const rawValue = line.slice(index + 1).trim();

    if (!rawValue) {
      result[key] = [];
      currentArrayKey = key;
      continue;
    }

    currentArrayKey = '';
    if (rawValue === 'true' || rawValue === 'false') result[key] = rawValue === 'true';
    else result[key] = stripQuotes(rawValue);
  }

  return result;
}

function stripQuotes(value) {
  return value.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
}

function stringifyFrontmatter(data) {
  const lines = ['---'];

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) lines.push(`  - ${toYamlScalar(item)}`);
      continue;
    }

    if (typeof value === 'boolean') {
      lines.push(`${key}: ${value ? 'true' : 'false'}`);
      continue;
    }

    lines.push(`${key}: ${toYamlScalar(value)}`);
  }

  lines.push('---');
  return lines.join('\n');
}

function toYamlScalar(value) {
  return JSON.stringify(String(value));
}

function buildMarkdownBody(rawContent, title) {
  const normalized = rawContent.replace(/\r\n/g, '\n').trim();
  const withoutLeadingTitle = normalized.startsWith(`${title}\n`)
    ? normalized.slice(title.length).trim()
    : normalized;

  return withoutLeadingTitle
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .join('\n\n');
}

function buildExcerpt(body, locale) {
  const plain = body.replace(/[#>*`-]/g, ' ').replace(/\s+/g, ' ').trim();
  const limit = locale === 'zh' ? 64 : 140;
  return plain.length > limit ? `${plain.slice(0, limit).trim()}...` : plain;
}

function uniqueStrings(values) {
  return [...new Set((values ?? []).map((value) => String(value).trim()).filter(Boolean))];
}

function startCase(value) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}