import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const rootDir = process.cwd();

await loadEnvFile(path.join(rootDir, '.env.local'));
await loadEnvFile(path.join(rootDir, '.env'));

const config = await loadSyncConfig();
const sources = (config.sources ?? []).filter((source) => source.enabled !== false);

if (sources.length === 0) {
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
const today = new Date().toISOString().slice(0, 10);
let changedCount = 0;

for (const source of sources) {
  const normalized = normalizeSource(source, config);
  const documentToken = normalized.documentToken ?? extractDocumentToken(normalized.url);

  if (!documentToken) {
    throw new Error(`Unable to resolve a Feishu document token for ${normalized.pathSlug}. Use a /docx/ URL or set documentToken explicitly.`);
  }

  const [documentInfo, rawContent] = await Promise.all([
    getDocumentInfo({ baseUrl, accessToken, documentToken }),
    getDocumentRawContent({ baseUrl, accessToken, documentToken })
  ]);

  const existing = await readExistingPost(normalized.outputPath);
  const title = normalized.title || documentInfo.title || existing.frontmatter.title || startCase(normalized.pathSlug);
  const body = buildMarkdownBody(rawContent, title);
  const excerpt =
    normalized.excerpt ||
    existing.frontmatter.excerpt ||
    buildExcerpt(body, normalized.locale);

  const frontmatter = {
    pathSlug: normalized.pathSlug,
    locale: normalized.locale,
    translationKey: normalized.translationKey,
    title,
    excerpt,
    category: normalized.category,
    publishedAt: existing.frontmatter.publishedAt || normalized.publishedAt || today,
    updatedAt: today,
    featured: normalized.featured,
    tags: normalized.tags,
    accent: normalized.accent,
    heroEyebrow: normalized.heroEyebrow,
    sourcePlatform: 'feishu',
    sourceUrl: normalized.url
  };

  const nextFile = `${stringifyFrontmatter(frontmatter)}\n\n${body}\n`;

  if (existing.content === nextFile) {
    console.log(`No changes for ${normalized.locale}/${normalized.pathSlug}`);
    continue;
  }

  await mkdir(path.dirname(normalized.outputPath), { recursive: true });
  await writeFile(normalized.outputPath, nextFile, 'utf8');
  changedCount += 1;
  console.log(`Updated ${path.relative(rootDir, normalized.outputPath)}`);
}

console.log(`Feishu sync complete. ${changedCount} file(s) updated.`);

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

function normalizeSource(source, config) {
  if (!source.url) throw new Error('Each Feishu source needs a url.');
  if (!source.locale) throw new Error(`Missing locale for source ${source.url}`);
  if (!source.pathSlug) throw new Error(`Missing pathSlug for source ${source.url}`);

  const locale = source.locale;
  const pathSlug = source.pathSlug;

  return {
    url: source.url,
    locale,
    pathSlug,
    translationKey: source.translationKey || pathSlug,
    category: source.category || config.defaultCategory || 'Feishu Sync',
    tags: uniqueStrings(source.tags?.length ? source.tags : config.defaultTags || ['Feishu']),
    heroEyebrow: source.heroEyebrow || config.defaultHeroEyebrow || 'Feishu',
    accent: source.accent || config.defaultAccent || 'cyan',
    featured: Boolean(source.featured),
    publishedAt: source.publishedAt,
    title: source.title,
    excerpt: source.excerpt,
    documentToken: source.documentToken,
    outputPath: path.join(rootDir, 'src', 'content', 'posts', locale, `${pathSlug}.md`)
  };
}

function extractDocumentToken(url) {
  const match = url.match(/\/docx\/([A-Za-z0-9]+)/i);
  return match?.[1] ?? '';
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