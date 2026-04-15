import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const postsRoot = path.join(projectRoot, 'src', 'content', 'posts');
const supportedLocales = new Set(['zh', 'en']);
const supportedSeries = new Set(['linux', 'docker', 'k8s', 'services']);
const frontmatterOrder = [
  'locale',
  'translationKey',
  'pathSlug',
  'title',
  'summary',
  'publishedAt',
  'updatedAt',
  'readingMinutes',
  'series',
  'seriesOrder',
  'featured',
  'tags',
  'translationSourceHash',
  'translationStatus',
  'translationModel',
  'translationUpdatedAt'
];
const folderDocOverrides = {
  zh: {
    DN2AdvgDho0zw2xkc7acfddEnxw: {
      slug: 'ubuntu-install-docker-compose',
      series: 'docker',
      seriesOrder: 4,
      featured: false
    },
    ExWvdryY5okDe1x1DKqcfunHnKf: {
      slug: 'rancher-deployment',
      series: 'services',
      seriesOrder: 1,
      featured: false
    },
    AwpXdCS3Co7v2rxbToKcM1RonDc: {
      slug: 'minio-single-node-deployment',
      series: 'services',
      seriesOrder: 2,
      featured: false
    },
    M7zAd8ZkaoT8DTx0bJPcdmLanDh: {
      slug: 'elasticsearch-cluster-vip-deployment',
      series: 'services',
      seriesOrder: 3,
      featured: false
    },
    QldMdVwPeoeZHNxcy8UcVc2On4e: {
      slug: 'harbor-deployment',
      series: 'services',
      seriesOrder: 4,
      featured: false
    },
    QCQJdQ1AhoECs5xsJmacimnPnUe: {
      slug: 'postgres-cluster-deployment',
      series: 'services',
      seriesOrder: 5,
      featured: false
    },
    S9XFdE2vOojk84xUzphckg3ln9k: {
      slug: 'kubernetes-single-node',
      series: 'k8s',
      seriesOrder: 3,
      featured: false
    }
  },
  en: {}
};

async function loadDotenvFile(filePath) {
  try {
    const raw = await readFile(filePath, 'utf8');

    for (const line of normalizeLineEndings(raw).split('\n')) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(trimmed);
      if (!match) {
        continue;
      }

      const [, key, rawValue] = match;
      if (process.env[key] !== undefined) {
        continue;
      }

      let value = rawValue.trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      return;
    }

    throw error;
  }
}

function printHelp() {
  console.log(`
Usage:
  npm run sync:feishu -- [--dry-run] [--slug your-slug] [--locale zh,en] [--translate-en]

Required env:
  FEISHU_APP_ID
  FEISHU_APP_SECRET
  One of:
    - FEISHU_BITABLE_APP_TOKEN + FEISHU_BITABLE_ARTICLES_TABLE_ID
    - FEISHU_DRIVE_ZH_FOLDER_TOKEN

Optional env:
  FEISHU_BITABLE_ARTICLES_VIEW_ID
  FEISHU_DRIVE_ZH_FOLDER_TOKEN
  FEISHU_DRIVE_EN_FOLDER_TOKEN     legacy manual en pull only
  FEISHU_OPEN_BASE_URL           default: https://open.feishu.cn
  FEISHU_SYNC_LOCALES            default: zh
  FEISHU_SYNC_TIMEOUT_MS         default: 20000
  FEISHU_SYNC_USE_RAW_CONTENT    default: false

Notes:
  - Bitable mode syncs metadata plus body.
  - Folder mode keeps local frontmatter as metadata and only refreshes Markdown body.
  - The script updates files under src/content/posts/<locale>/.
  - Use --translate-en to generate/update English Markdown right after zh sync.
  - Existing Markdown remains the fallback when you do not run sync.
`.trim());
}

function parseArguments(argv) {
  const flags = new Map();

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith('--')) {
      continue;
    }

    if (token.includes('=')) {
      const [key, value] = token.slice(2).split(/=(.*)/s, 2);
      flags.set(key, value);
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      flags.set(token.slice(2), true);
      continue;
    }

    flags.set(token.slice(2), next);
    index += 1;
  }

  return {
    dryRun: Boolean(flags.get('dry-run')),
    help: Boolean(flags.get('help')),
    locale: flags.get('locale'),
    slug: flags.get('slug'),
    translateEn: Boolean(flags.get('translate-en'))
  };
}

function run(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      env
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`));
    });

    child.on('error', reject);
  });
}

async function runEnglishTranslationSync(args) {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    throw new Error(
      'Missing OPENAI_API_KEY. --translate-en requires translation credentials so English Markdown can be generated right after zh sync.'
    );
  }

  const node = process.execPath;
  const translateArgs = args.slug
    ? ['./scripts/translate-posts.mjs', 'one', '--key', args.slug]
    : ['./scripts/translate-posts.mjs', 'changed'];

  await run(node, translateArgs);
}

function normalizeLineEndings(value) {
  return value.replace(/\r\n?/g, '\n');
}

function serializeScalar(value) {
  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }

  if (typeof value !== 'string') {
    throw new Error(`Unsupported frontmatter value: ${String(value)}`);
  }

  if (/^[A-Za-z0-9][A-Za-z0-9._:/+-]*$/.test(value)) {
    return value;
  }

  return JSON.stringify(value);
}

function serializeFrontmatter(frontmatter) {
  const lines = ['---'];

  for (const key of frontmatterOrder) {
    const value = frontmatter[key];

    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
        continue;
      }

      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${serializeScalar(item)}`);
      }
      continue;
    }

    lines.push(`${key}: ${serializeScalar(value)}`);
  }

  lines.push('---');
  return `${lines.join('\n')}\n`;
}

async function writeMarkdownPost(filePath, frontmatter, body) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const serialized = `${serializeFrontmatter(frontmatter)}\n${body.trim()}\n`;
  await writeFile(filePath, serialized, 'utf8');
}

function parseLocaleSet(value) {
  const raw = value || process.env.FEISHU_SYNC_LOCALES || 'zh';
  const locales = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (!locales.length) {
    throw new Error('At least one locale must be selected for Feishu sync.');
  }

  for (const locale of locales) {
    if (!supportedLocales.has(locale)) {
      throw new Error(`Unsupported locale "${locale}". Use zh, en, or both.`);
    }
  }

  return locales;
}

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing ${name}. Copy .env.example and fill the Feishu values first.`);
  }

  return value;
}

function getOptionalEnv(name) {
  return process.env[name]?.trim() || '';
}

function parseTimeout(value) {
  const timeout = Number.parseInt(value || process.env.FEISHU_SYNC_TIMEOUT_MS || '20000', 10);

  if (!Number.isFinite(timeout) || timeout <= 0) {
    throw new Error('FEISHU_SYNC_TIMEOUT_MS must be a positive integer.');
  }

  return timeout;
}

function parseBoolean(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

function normalizeText(value) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeText(item))
      .filter(Boolean)
      .join(', ')
      .trim();
  }

  if (value && typeof value === 'object') {
    const candidates = [
      value.text,
      value.name,
      value.value,
      value.title,
      value.content,
      value.email,
      value.url
    ];

    for (const candidate of candidates) {
      const normalized = normalizeText(candidate);
      if (normalized) {
        return normalized;
      }
    }
  }

  return '';
}

function normalizeTextList(value) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return normalizeTextList(parsed);
        }
      } catch {
        // Fall through to comma-split parsing.
      }
    }

    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .flatMap((item) => {
      if (typeof item === 'string') {
        return item
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean);
      }

      const normalized = normalizeText(item);
      return normalized ? [normalized] : [];
    })
    .filter(Boolean);
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  const normalized = normalizeText(value).toLowerCase();
  return ['1', 'true', 'yes', 'y', 'checked'].includes(normalized);
}

function normalizeNumber(value, fallback) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const text = normalizeText(value);
  const parsed = Number.parseFloat(text);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeDate(value, fallback) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const text = normalizeText(value);
  if (!text) {
    return fallback;
  }

  if (/^\d{13}$/.test(text)) {
    return new Date(Number.parseInt(text, 10)).toISOString().slice(0, 10);
  }

  if (/^\d{10}$/.test(text)) {
    return new Date(Number.parseInt(text, 10) * 1000).toISOString().slice(0, 10);
  }

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toISOString().slice(0, 10);
}

function estimateReadingMinutes(markdown) {
  const cjkCharacters = (markdown.match(/\p{Script=Han}/gu) || []).length;
  const latinWords = (markdown.match(/[A-Za-z0-9_./:-]+/g) || []).length;
  const weightedTokens = cjkCharacters + latinWords;
  return Math.max(1, Math.ceil(weightedTokens / 220));
}

function buildSourceHash(post) {
  const payload = {
    translationKey: post.translationKey,
    pathSlug: post.pathSlug,
    title: post.title,
    summary: post.summary,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    readingMinutes: post.readingMinutes,
    series: post.series,
    seriesOrder: post.seriesOrder,
    featured: post.featured,
    tags: post.tags,
    body: post.body
  };

  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function getField(fields, ...candidates) {
  for (const key of candidates) {
    if (Object.hasOwn(fields, key)) {
      return fields[key];
    }
  }

  return undefined;
}

function normalizeStatus(value) {
  return normalizeText(value).toLowerCase();
}

function createAbortSignal(timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    dispose() {
      clearTimeout(timer);
    }
  };
}

class FeishuClient {
  constructor(options) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.timeoutMs = options.timeoutMs;
    this.appId = options.appId;
    this.appSecret = options.appSecret;
    this.accessToken = null;
  }

  async ensureAccessToken() {
    if (this.accessToken) {
      return this.accessToken;
    }

    const response = await this.request('/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      authenticated: false,
      body: {
        app_id: this.appId,
        app_secret: this.appSecret
      }
    });

    const token = response?.tenant_access_token;
    if (!token) {
      throw new Error('Feishu auth succeeded but no tenant_access_token was returned.');
    }

    this.accessToken = token;
    return token;
  }

  async request(pathname, options = {}) {
    const method = options.method || 'GET';
    const url = new URL(`${this.baseUrl}${pathname}`);

    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (options.authenticated !== false) {
      headers.Authorization = `Bearer ${await this.ensureAccessToken()}`;
    }

    const { signal, dispose } = createAbortSignal(this.timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal
      });
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = json?.msg || json?.message || response.statusText;
        throw new Error(`Feishu request failed (${response.status}) for ${pathname}: ${message}`);
      }

      if (json?.code && json.code !== 0) {
        throw new Error(`Feishu API error for ${pathname}: ${json.msg || `code ${json.code}`}`);
      }

      return json?.data ?? json;
    } finally {
      dispose();
    }
  }

  async listArticleRecords(appToken, tableId, viewId) {
    let pageToken;
    const records = [];

    do {
      const data = await this.request(
        `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
        {
          query: {
            page_size: 200,
            page_token: pageToken,
            view_id: viewId
          }
        }
      );

      records.push(...(data?.items || []));
      pageToken = data?.has_more ? data?.page_token : undefined;
    } while (pageToken);

    return records;
  }

  async listFolderChildren(folderToken) {
    let pageToken;
    const items = [];

    do {
      const data = await this.request(`/open-apis/drive/explorer/v2/folder/${folderToken}/children`, {
        query: {
          page_size: 200,
          page_token: pageToken
        }
      });

      const directItems = data?.items || data?.files || Object.values(data?.children || {});
      items.push(...directItems);
      pageToken = data?.has_more ? data?.next_page_token || data?.page_token : undefined;
    } while (pageToken);

    return items.map((item) => ({
      token: normalizeText(item.token || item.file_token || item.obj_token),
      name: normalizeText(item.name || item.title),
      type: normalizeStatus(item.type || item.file_type || item.obj_type)
    }));
  }

  async fetchDocumentMarkdown(documentId, preferRawContent) {
    if (preferRawContent) {
      const rawContent = await this.fetchDocumentRawContent(documentId);
      if (rawContent) {
        return rawContent;
      }
    }

    try {
      const children = await this.fetchBlockChildren(documentId, documentId);
      const markdown = renderBlocks(children).trim();

      if (markdown) {
        return markdown;
      }
    } catch (error) {
      if (!preferRawContent) {
        const rawContent = await this.fetchDocumentRawContent(documentId);
        if (rawContent) {
          return rawContent;
        }
      }

      throw error;
    }

    throw new Error(`Feishu document ${documentId} returned no readable content.`);
  }

  async fetchDocumentRawContent(documentId) {
    try {
      const data = await this.request(`/open-apis/docx/v1/documents/${documentId}/raw_content`);
      const raw = normalizeText(data?.content || data?.raw_content || data?.text);
      return raw ? normalizeLineEndings(raw) : '';
    } catch {
      return '';
    }
  }

  async fetchBlockChildren(documentId, blockId) {
    let pageToken;
    const children = [];

    do {
      const data = await this.request(
        `/open-apis/docx/v1/documents/${documentId}/blocks/${blockId}/children`,
        {
          query: {
            page_size: 500,
            page_token: pageToken
          }
        }
      );

      for (const item of data?.items || []) {
        const hasChildren = Boolean(item?.has_children || item?.children?.length);
        const node = { ...item };

        if (hasChildren) {
          node.childNodes = await this.fetchBlockChildren(documentId, item.block_id);
        }

        children.push(node);
      }

      pageToken = data?.has_more ? data?.page_token : undefined;
    } while (pageToken);

    return children;
  }
}

function parseScalar(rawValue) {
  const value = rawValue.trim();

  if (value.startsWith('"') && value.endsWith('"')) {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'string') {
      const nested = parsed.trim();
      if (
        (nested.startsWith('[') && nested.endsWith(']')) ||
        (nested.startsWith('{') && nested.endsWith('}'))
      ) {
        try {
          return JSON.parse(nested);
        } catch {
          return parsed;
        }
      }
    }

    return parsed;
  }

  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'");
  }

  if (
    (value.startsWith('[') && value.endsWith(']')) ||
    (value.startsWith('{') && value.endsWith('}'))
  ) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  if (/^-?\d+$/.test(value)) {
    return Number(value);
  }

  return value;
}

function parseFrontmatter(block) {
  const lines = normalizeLineEndings(block).split('\n');
  const frontmatter = {};

  for (let index = 0; index < lines.length; ) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const match = /^([A-Za-z][A-Za-z0-9_]*):(?:\s*(.*))?$/.exec(line);
    if (!match) {
      throw new Error(`Unsupported frontmatter line: ${line}`);
    }

    const [, key, inlineValue = ''] = match;

    if (!inlineValue) {
      const values = [];
      index += 1;

      while (index < lines.length && /^\s+-\s+/.test(lines[index])) {
        values.push(parseScalar(lines[index].replace(/^\s+-\s+/, '')));
        index += 1;
      }

      frontmatter[key] = values;
      continue;
    }

    frontmatter[key] = parseScalar(inlineValue);
    index += 1;
  }

  return frontmatter;
}

function parseMarkdownPost(rawContent, filePath) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/u.exec(rawContent);

  if (!match) {
    throw new Error(`Missing valid frontmatter in ${filePath}`);
  }

  const [, frontmatterBlock, body] = match;
  return {
    filePath,
    frontmatter: parseFrontmatter(frontmatterBlock),
    body: normalizeLineEndings(body).trimEnd()
  };
}

async function listMarkdownFiles(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.join(directoryPath, entry.name))
    .sort((left, right) => left.localeCompare(right));
}

async function loadLocalePosts(locale) {
  const root = path.join(postsRoot, locale);
  const filePaths = await listMarkdownFiles(root);
  const posts = [];

  for (const filePath of filePaths) {
    const rawContent = await readFile(filePath, 'utf8');
    const post = parseMarkdownPost(rawContent, filePath);

    if (post.frontmatter.locale !== locale) {
      throw new Error(`Expected locale "${locale}" in ${filePath}`);
    }

    posts.push(post);
  }

  return posts;
}

function normalizeFolderDocumentType(value) {
  const normalized = normalizeStatus(value);
  return (
    normalized === 'doc' ||
    normalized === 'docx' ||
    normalized === 'sheet' ||
    normalized === 'bitable' ||
    normalized === 'wiki' ||
    normalized === 'shortcut'
  );
}

function slugifyTitle(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function inferSeriesFromTrail(document) {
  const trail = document.trail || [];

  if (trail.some((item) => /docker/i.test(item))) {
    return 'docker';
  }

  if (trail.some((item) => /kubernetes|k8s/i.test(item))) {
    return 'k8s';
  }

  return 'services';
}

function extractSummary(markdown, fallbackTitle) {
  const paragraphs = normalizeLineEndings(markdown)
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean);

  for (const paragraph of paragraphs) {
    if (
      paragraph.startsWith('#') ||
      paragraph.startsWith('>') ||
      paragraph.startsWith('- ') ||
      paragraph.startsWith('* ') ||
      paragraph.startsWith('```') ||
      paragraph.startsWith('![')
    ) {
      continue;
    }

    const compact = paragraph.replace(/\s+/g, ' ').trim();
    const cjkCount = (compact.match(/\p{Script=Han}/gu) || []).length;
    const latinTokenCount = (compact.match(/[A-Za-z0-9_./:-]+/g) || []).length;
    const hasSentencePunctuation = /[。！？；;,.]/.test(compact);

    if (compact.length < 16) {
      continue;
    }

    if (cjkCount < 8 && latinTokenCount < 6) {
      continue;
    }

    if (!hasSentencePunctuation && cjkCount < 12) {
      continue;
    }

    return compact.length > 140 ? `${compact.slice(0, 137)}...` : compact;
  }

  return fallbackTitle;
}

function buildFolderPostDraft(locale, document, body, existingPost) {
  const override = folderDocOverrides[locale]?.[document.token] || {};
  const slug =
    existingPost?.frontmatter.pathSlug ||
    override.slug ||
    slugifyTitle(document.name) ||
    `feishu-${document.token.slice(0, 8).toLowerCase()}`;
  const series = existingPost?.frontmatter.series || override.series || inferSeriesFromTrail(document);

  if (!supportedSeries.has(series)) {
    throw new Error(`Unsupported series "${series}" for Feishu document "${document.name}".`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const featured = override.featured ?? existingPost?.frontmatter.featured ?? false;
  const summary = extractSummary(body, document.name);

  return {
    locale,
    translationKey: existingPost?.frontmatter.translationKey || override.slug || slug,
    pathSlug: slug,
    title: document.name,
    summary,
    publishedAt: existingPost?.frontmatter.publishedAt || today,
    updatedAt: today,
    readingMinutes: estimateReadingMinutes(body),
    series,
    seriesOrder: existingPost?.frontmatter.seriesOrder || override.seriesOrder || 99,
    featured,
    tags: normalizeTextList(existingPost?.frontmatter.tags)
  };
}

async function syncFolderPosts(locale, options) {
  const folderToken = getOptionalEnv(
    locale === 'zh' ? 'FEISHU_DRIVE_ZH_FOLDER_TOKEN' : 'FEISHU_DRIVE_EN_FOLDER_TOKEN'
  );

  if (!folderToken) {
    return 0;
  }

  const localPosts = await loadLocalePosts(locale);
  const folderItems = await walkFolderTree(options.client, folderToken);
  const documents = folderItems.filter(
    (item) => item.token && item.name && normalizeFolderDocumentType(item.type)
  );
  const localPostsByTitle = new Map(localPosts.map((post) => [post.frontmatter.title, post]));
  const localPostsBySlug = new Map(localPosts.map((post) => [post.frontmatter.pathSlug, post]));

  let writeCount = 0;

  for (const document of documents) {
    const override = folderDocOverrides[locale]?.[document.token];
    const existingPost =
      (override?.slug ? localPostsBySlug.get(override.slug) : undefined) ||
      localPostsByTitle.get(document.name);

    const targetSlug =
      existingPost?.frontmatter.pathSlug ||
      override?.slug ||
      slugifyTitle(document.name) ||
      `feishu-${document.token.slice(0, 8).toLowerCase()}`;

    if (options.slug && targetSlug !== options.slug) {
      continue;
    }

    const body = normalizeLineEndings(
      await options.client.fetchDocumentMarkdown(document.token, options.preferRawContent)
    ).trim();
    const nextFrontmatter = buildFolderPostDraft(locale, document, body, existingPost);
    const outputPath = existingPost?.filePath || path.join(postsRoot, locale, `${targetSlug}.md`);

    if (options.dryRun) {
      console.log(
        `[dry-run] ${locale} -> ${path.relative(projectRoot, outputPath)} (${document.trail.join(' / ')})`
      );
    } else {
      await writeMarkdownPost(outputPath, nextFrontmatter, body);
      console.log(`synced ${locale} -> ${path.relative(projectRoot, outputPath)} (${document.trail.join(' / ')})`);
    }

    writeCount += 1;
  }

  return writeCount;
}

async function walkFolderTree(client, folderToken, trail = []) {
  const entries = await client.listFolderChildren(folderToken);
  const results = [];

  for (const entry of entries) {
    const nextTrail = [...trail, entry.name];

    if (entry.type === 'folder') {
      results.push(...(await walkFolderTree(client, entry.token, nextTrail)));
      continue;
    }

    results.push({
      ...entry,
      trail: nextTrail
    });
  }

  return results;
}

function getBlockPayload(block) {
  const knownKeys = [
    'text',
    'heading1',
    'heading2',
    'heading3',
    'heading4',
    'heading5',
    'heading6',
    'bullet',
    'ordered',
    'todo',
    'code',
    'quote',
    'callout',
    'equation',
    'divider',
    'image',
    'table',
    'table_cell'
  ];

  for (const key of knownKeys) {
    if (block?.[key]) {
      return {
        type: key,
        value: block[key]
      };
    }
  }

  return {
    type: normalizeText(block?.block_type),
    value: {}
  };
}

function escapeInlineCode(value) {
  return value.replace(/`/g, '\\`');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function applyInlineStyle(content, style, options = {}) {
  const format = options.format === 'html' ? 'html' : 'markdown';
  const text = format === 'html' ? escapeHtml(content) : content;

  if (style?.inline_code) {
    return format === 'html' ? `<code>${text}</code>` : `\`${escapeInlineCode(content)}\``;
  }

  let result = text;

  if (style?.bold) {
    result = format === 'html' ? `<strong>${result}</strong>` : `**${result}**`;
  }

  if (style?.italic) {
    result = format === 'html' ? `<em>${result}</em>` : `*${result}*`;
  }

  if (style?.strikethrough) {
    result = format === 'html' ? `<s>${result}</s>` : `~~${result}~~`;
  }

  if (style?.underline) {
    result = format === 'html' ? `<u>${result}</u>` : `<u>${result}</u>`;
  }

  return result;
}

function renderTextElements(elements, options = {}) {
  const format = options.format === 'html' ? 'html' : 'markdown';

  if (!Array.isArray(elements)) {
    return '';
  }

  const parts = [];

  for (const element of elements) {
    if (typeof element?.text_run?.content === 'string') {
      const content = element.text_run.content;
      const link = normalizeText(element.text_run.link || element.text_run.href);
      const style = element.text_run.text_element_style;
      const styledContent = applyInlineStyle(content, style, { format });

      if (link) {
        parts.push(
          format === 'html'
            ? `<a href="${escapeHtml(link)}">${styledContent}</a>`
            : `[${styledContent}](${link})`
        );
      } else {
        parts.push(styledContent);
      }
      continue;
    }

    if (typeof element?.mention_user?.name === 'string') {
      const mention = `@${element.mention_user.name}`;
      parts.push(format === 'html' ? escapeHtml(mention) : mention);
      continue;
    }

    if (typeof element?.mention_doc?.title === 'string') {
      const title = element.mention_doc.title;
      parts.push(format === 'html' ? escapeHtml(title) : title);
      continue;
    }

    if (typeof element?.equation?.content === 'string') {
      const equation = `$${element.equation.content}$`;
      parts.push(format === 'html' ? escapeHtml(equation) : equation);
      continue;
    }

    if (typeof element?.text_element?.content === 'string') {
      const content = element.text_element.content;
      parts.push(format === 'html' ? escapeHtml(content) : content);
      continue;
    }

    const fallback = normalizeText(element);
    if (fallback) {
      parts.push(format === 'html' ? escapeHtml(fallback) : fallback);
    }
  }

  return parts.join('');
}

function renderPlainTextElements(elements) {
  if (!Array.isArray(elements)) {
    return '';
  }

  const parts = [];

  for (const element of elements) {
    if (typeof element?.text_run?.content === 'string') {
      parts.push(element.text_run.content);
      continue;
    }

    if (typeof element?.mention_user?.name === 'string') {
      parts.push(`@${element.mention_user.name}`);
      continue;
    }

    if (typeof element?.mention_doc?.title === 'string') {
      parts.push(element.mention_doc.title);
      continue;
    }

    if (typeof element?.equation?.content === 'string') {
      parts.push(`$${element.equation.content}$`);
      continue;
    }

    if (typeof element?.text_element?.content === 'string') {
      parts.push(element.text_element.content);
      continue;
    }

    const fallback = normalizeText(element);
    if (fallback) {
      parts.push(fallback);
    }
  }

  return parts.join('');
}

function renderTableCellHtmlBlocks(blocks, options = {}) {
  const parts = [];

  for (const block of blocks) {
    const { type, value } = getBlockPayload(block);
    const children = renderTableCellHtmlBlocks(block.childNodes || [], options);
    const richText = renderTextElements(value?.elements, { format: 'html' });
    const plainText = normalizeText(value?.text);

    switch (type) {
      case 'text':
      case 'heading1':
      case 'heading2':
      case 'heading3':
      case 'heading4':
      case 'heading5':
      case 'heading6': {
        const content = richText || escapeHtml(plainText);
        if (content) {
          parts.push(content);
        }
        if (children) {
          parts.push(children);
        }
        break;
      }
      case 'bullet':
      case 'ordered':
      case 'todo': {
        const marker =
          type === 'bullet'
            ? '&bull; '
            : type === 'ordered'
              ? `${options.index || 1}. `
              : value?.checked
                ? '[x] '
                : '[ ] ';
        const content = richText || escapeHtml(plainText);
        parts.push(`${marker}${content}`.trim());
        if (children) {
          parts.push(children);
        }
        break;
      }
      case 'quote':
      case 'callout': {
        const content = [richText || escapeHtml(plainText), children].filter(Boolean).join('<br />');
        if (content) {
          parts.push(content);
        }
        break;
      }
      case 'code': {
        const codeText = renderPlainTextElements(value?.elements) || plainText || children;
        if (codeText) {
          parts.push(`<code>${escapeHtml(codeText).replace(/\n/g, '<br />')}</code>`);
        }
        break;
      }
      case 'equation': {
        const equation = normalizeText(value?.content || renderTextElements(value?.elements));
        if (equation) {
          parts.push(escapeHtml(`$${equation}$`));
        }
        break;
      }
      case 'image': {
        const alt = normalizeText(value?.caption) || 'Image from Feishu';
        parts.push(escapeHtml(`[${alt}]`));
        break;
      }
      case 'divider':
        break;
      default: {
        const fallback = [richText, escapeHtml(plainText), children].filter(Boolean).join('<br />');
        if (fallback) {
          parts.push(fallback);
        }
      }
    }
  }

  return parts
    .filter(Boolean)
    .join('<br />')
    .replace(/(?:<br \/>){3,}/g, '<br /><br />');
}

function buildTableGrid(cellIds, mergeInfo, rowCount, columnCount) {
  const grid = Array.from({ length: rowCount }, () => Array(columnCount).fill(null));
  let currentRow = 0;
  let currentColumn = 0;

  const advanceCursor = () => {
    while (currentRow < rowCount && grid[currentRow][currentColumn]) {
      currentColumn += 1;
      if (currentColumn >= columnCount) {
        currentRow += 1;
        currentColumn = 0;
      }
    }
  };

  for (let index = 0; index < cellIds.length; index += 1) {
    advanceCursor();
    if (currentRow >= rowCount) {
      break;
    }

    const merge = mergeInfo[index] || {};
    const rowspan = Math.max(1, Number(merge.row_span) || 1);
    const colspan = Math.max(1, Number(merge.col_span) || 1);
    const cell = {
      cellId: cellIds[index],
      rowspan,
      colspan,
      isOrigin: true
    };

    for (let rowOffset = 0; rowOffset < rowspan; rowOffset += 1) {
      for (let columnOffset = 0; columnOffset < colspan; columnOffset += 1) {
        const rowIndex = currentRow + rowOffset;
        const columnIndex = currentColumn + columnOffset;

        if (rowIndex >= rowCount || columnIndex >= columnCount) {
          continue;
        }

        grid[rowIndex][columnIndex] =
          rowOffset === 0 && columnOffset === 0 ? cell : { isOrigin: false };
      }
    }

    currentColumn += colspan;
    if (currentColumn >= columnCount) {
      currentRow += 1;
      currentColumn = 0;
    }
  }

  return grid;
}

function renderTable(block) {
  const { value } = getBlockPayload(block);
  const property = value?.property || {};
  const rowCount = Math.max(1, Number(property.row_size) || 0);
  const columnCount = Math.max(1, Number(property.column_size) || 0);
  const cellIds = Array.isArray(value?.cells) ? value.cells : [];
  const mergeInfo = Array.isArray(property.merge_info) ? property.merge_info : [];

  if (!cellIds.length || !rowCount || !columnCount) {
    return renderBlocks(block.childNodes || []);
  }

  const cellMap = new Map((block.childNodes || []).map((cell) => [cell.block_id, cell]));
  const grid = buildTableGrid(cellIds, mergeInfo, rowCount, columnCount);
  const rowMarkup = grid
    .map((row, rowIndex) => {
      const tag = rowIndex === 0 ? 'th' : 'td';
      const cells = row
        .map((cell) => {
          if (!cell?.isOrigin || !cell.cellId) {
            return '';
          }

          const cellBlock = cellMap.get(cell.cellId);
          const content = renderTableCellHtmlBlocks(cellBlock?.childNodes || []);
          const spanAttrs = [
            cell.colspan > 1 ? ` colspan="${cell.colspan}"` : '',
            cell.rowspan > 1 ? ` rowspan="${cell.rowspan}"` : ''
          ].join('');

          return `<${tag}${spanAttrs}>${content || '&nbsp;'}</${tag}>`;
        })
        .filter(Boolean)
        .join('');

      return cells ? `<tr>${cells}</tr>` : '';
    })
    .filter(Boolean);

  if (!rowMarkup.length) {
    return renderBlocks(block.childNodes || []);
  }

  const [headRow, ...bodyRows] = rowMarkup;
  const head = `<thead>${headRow}</thead>`;
  const body = bodyRows.length ? `<tbody>${bodyRows.join('')}</tbody>` : '';
  return `<div class="feishu-table-wrap"><table>${head}${body}</table></div>`;
}

function indentBlock(text, prefix) {
  return text
    .split('\n')
    .map((line, index) => (index === 0 ? `${prefix}${line}` : `  ${line}`))
    .join('\n');
}

function renderListItem(marker, text, children) {
  const lines = [];
  lines.push(`${marker} ${text || ''}`.trimEnd());

  if (children.length > 0) {
    for (const child of children) {
      lines.push(indentBlock(child, '  '));
    }
  }

  return lines.join('\n');
}

function renderBlock(block, index) {
  const { type, value } = getBlockPayload(block);
  const children = renderBlocks(block.childNodes || []);
  const richText = renderTextElements(value?.elements);

  switch (type) {
    case 'text':
      return [richText || normalizeText(value?.text) || '', children].filter(Boolean).join('\n\n');
    case 'heading1':
      return [`# ${richText || normalizeText(value?.text)}`.trimEnd(), children]
        .filter(Boolean)
        .join('\n\n');
    case 'heading2':
      return [`## ${richText || normalizeText(value?.text)}`.trimEnd(), children]
        .filter(Boolean)
        .join('\n\n');
    case 'heading3':
      return [`### ${richText || normalizeText(value?.text)}`.trimEnd(), children]
        .filter(Boolean)
        .join('\n\n');
    case 'heading4':
      return [`#### ${richText || normalizeText(value?.text)}`.trimEnd(), children]
        .filter(Boolean)
        .join('\n\n');
    case 'heading5':
      return [`##### ${richText || normalizeText(value?.text)}`.trimEnd(), children]
        .filter(Boolean)
        .join('\n\n');
    case 'heading6':
      return [`###### ${richText || normalizeText(value?.text)}`.trimEnd(), children]
        .filter(Boolean)
        .join('\n\n');
    case 'bullet':
      return renderListItem('-', richText || normalizeText(value?.text), children ? [children] : []);
    case 'ordered':
      return renderListItem(`${index + 1}.`, richText || normalizeText(value?.text), children ? [children] : []);
    case 'todo': {
      const checked = Boolean(value?.checked);
      return renderListItem(
        checked ? '- [x]' : '- [ ]',
        richText || normalizeText(value?.text),
        children ? [children] : []
      );
    }
    case 'quote': {
      const quoteBody = [richText || normalizeText(value?.text), children].filter(Boolean).join('\n\n');
      return quoteBody
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');
    }
    case 'callout': {
      const calloutBody = [richText || normalizeText(value?.text), children].filter(Boolean).join('\n\n');
      return calloutBody
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');
    }
    case 'code': {
      const language = normalizeText(value?.language || value?.lang);
      const codeText = renderPlainTextElements(value?.elements) || normalizeText(value?.text) || children;
      return `\`\`\`${language}\n${codeText.trimEnd()}\n\`\`\``;
    }
    case 'equation':
      return `$$\n${normalizeText(value?.content || richText)}\n$$`;
    case 'divider':
      return '---';
    case 'image': {
      const alt = normalizeText(value?.caption) || 'Image from Feishu';
      const token = normalizeText(value?.token || value?.file_token);
      return token
        ? `> [Image omitted from Feishu sync: ${alt} (${token})]`
        : `> [Image omitted from Feishu sync: ${alt}]`;
    }
    case 'table':
      return renderTable(block);
    case 'table_cell':
      return children;
    default: {
      const fallback = [richText, normalizeText(value?.text), children].filter(Boolean).join('\n\n');
      return fallback;
    }
  }
}

function renderBlocks(blocks) {
  return blocks
    .map((block, index) => renderBlock(block, index))
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n');
}

function buildLocaleFrontmatter(post, zhSourceHash) {
  const base = {
    locale: post.locale,
    translationKey: post.translationKey,
    pathSlug: post.pathSlug,
    title: post.title,
    summary: post.summary,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    readingMinutes: post.readingMinutes,
    series: post.series,
    seriesOrder: post.seriesOrder,
    featured: post.featured,
    tags: post.tags
  };

  if (post.locale === 'en' && zhSourceHash) {
    return {
      ...base,
      translationSourceHash: zhSourceHash,
      translationStatus: 'reviewed',
      translationModel: 'feishu-doc',
      translationUpdatedAt: new Date().toISOString().slice(0, 10)
    };
  }

  return base;
}

function normalizeRecord(record, slugFilter) {
  const fields = record?.fields || {};
  const pathSlug = normalizeText(getField(fields, 'slug'));

  if (!pathSlug) {
    throw new Error(`Bitable record ${record?.record_id || 'unknown'} is missing slug.`);
  }

  if (slugFilter && pathSlug !== slugFilter) {
    return null;
  }

  const series = normalizeText(getField(fields, 'series_slug'));
  if (!supportedSeries.has(series)) {
    throw new Error(`Record "${pathSlug}" has unsupported series_slug "${series}".`);
  }

  const publishedAt = normalizeDate(getField(fields, 'published_at'), new Date().toISOString().slice(0, 10));
  const updatedAt = normalizeDate(getField(fields, 'updated_at'), publishedAt);
  const seriesOrder = Math.trunc(normalizeNumber(getField(fields, 'series_order'), 1));
  const featured = normalizeBoolean(getField(fields, 'featured'));
  const tags = normalizeTextList(getField(fields, 'tag_slugs', 'tags'));

  return {
    recordId: record.record_id,
    translationKey: pathSlug,
    pathSlug,
    series,
    seriesOrder: seriesOrder > 0 ? seriesOrder : 1,
    featured,
    tags,
    publishedAt,
    updatedAt,
    locales: {
      zh: {
        locale: 'zh',
        status: normalizeStatus(getField(fields, 'zh_status')),
        docId: normalizeText(getField(fields, 'zh_doc_id')),
        title: normalizeText(getField(fields, 'zh_title')),
        summary: normalizeText(getField(fields, 'zh_summary'))
      },
      en: {
        locale: 'en',
        status: normalizeStatus(getField(fields, 'en_status')),
        docId: normalizeText(getField(fields, 'en_doc_id')),
        title: normalizeText(getField(fields, 'en_title')),
        summary: normalizeText(getField(fields, 'en_summary'))
      }
    }
  };
}

async function syncRecord(record, options) {
  const output = {};

  for (const locale of options.locales) {
    const localeMeta = record.locales[locale];

    if (localeMeta.status !== 'published') {
      continue;
    }

    if (!localeMeta.docId) {
      throw new Error(`Record "${record.pathSlug}" is published in ${locale} but has no ${locale}_doc_id.`);
    }

    if (!localeMeta.title || !localeMeta.summary) {
      throw new Error(
        `Record "${record.pathSlug}" is published in ${locale} but is missing ${locale}_title or ${locale}_summary.`
      );
    }

    const body = normalizeLineEndings(
      await options.client.fetchDocumentMarkdown(localeMeta.docId, options.preferRawContent)
    ).trim();

    output[locale] = {
      locale,
      translationKey: record.translationKey,
      pathSlug: record.pathSlug,
      title: localeMeta.title,
      summary: localeMeta.summary,
      publishedAt: record.publishedAt,
      updatedAt: record.updatedAt,
      readingMinutes: estimateReadingMinutes(body),
      series: record.series,
      seriesOrder: record.seriesOrder,
      featured: record.featured,
      tags: record.tags,
      body
    };
  }

  const zhSourceHash = output.zh ? buildSourceHash(output.zh) : undefined;
  return { output, zhSourceHash };
}

async function main() {
  const args = parseArguments(process.argv.slice(2));

  await loadDotenvFile(path.join(projectRoot, '.env'));
  await loadDotenvFile(path.join(projectRoot, '.env.local'));

  if (args.help) {
    printHelp();
    return;
  }

  const locales = parseLocaleSet(args.locale);
  const client = new FeishuClient({
    baseUrl: process.env.FEISHU_OPEN_BASE_URL || 'https://open.feishu.cn',
    timeoutMs: parseTimeout(),
    appId: getRequiredEnv('FEISHU_APP_ID'),
    appSecret: getRequiredEnv('FEISHU_APP_SECRET')
  });

  const preferRawContent = parseBoolean(process.env.FEISHU_SYNC_USE_RAW_CONTENT);
  const appToken = getOptionalEnv('FEISHU_BITABLE_APP_TOKEN');
  const tableId = getOptionalEnv('FEISHU_BITABLE_ARTICLES_TABLE_ID');
  const viewId = getOptionalEnv('FEISHU_BITABLE_ARTICLES_VIEW_ID');
  const zhFolderToken = getOptionalEnv('FEISHU_DRIVE_ZH_FOLDER_TOKEN');
  const enFolderToken = getOptionalEnv('FEISHU_DRIVE_EN_FOLDER_TOKEN');

  const folderModeEnabled = Boolean(zhFolderToken || enFolderToken);
  const bitableModeEnabled = Boolean(appToken && tableId);

  if (!folderModeEnabled && !bitableModeEnabled) {
    throw new Error(
      'Missing Feishu content source config. Fill either Bitable tokens or folder tokens in .env.'
    );
  }

  const shouldTranslateEn = args.translateEn && locales.includes('zh') && !args.dryRun;

  if (folderModeEnabled) {
    let writeCount = 0;

    for (const locale of locales) {
      writeCount += await syncFolderPosts(locale, {
        client,
        dryRun: args.dryRun,
        preferRawContent,
        slug: args.slug
      });
    }

    if (writeCount === 0) {
      console.log('No local posts matched the selected locale set and folder docs.');
      return;
    }

    console.log(
      args.dryRun
        ? `Dry run complete: ${writeCount} file(s) would be updated from Feishu folders.`
        : `Feishu folder sync complete: ${writeCount} file(s) updated.`
    );

    if (shouldTranslateEn) {
      await runEnglishTranslationSync(args);
    }

    return;
  }

  const records = await client.listArticleRecords(appToken, tableId, viewId);
  const normalizedRecords = records
    .map((record) => normalizeRecord(record, args.slug))
    .filter(Boolean);

  if (!normalizedRecords.length) {
    throw new Error(args.slug ? `No Feishu article record matched slug "${args.slug}".` : 'No article records found in Feishu Bitable.');
  }

  let writeCount = 0;

  for (const record of normalizedRecords) {
    const { output, zhSourceHash } = await syncRecord(record, {
      client,
      locales,
      preferRawContent
    });

    for (const locale of locales) {
      const post = output[locale];

      if (!post) {
        continue;
      }

      const filePath = path.join(postsRoot, locale, `${post.pathSlug}.md`);
      const frontmatter = buildLocaleFrontmatter(post, zhSourceHash);

      if (args.dryRun) {
        console.log(`[dry-run] ${locale} -> ${path.relative(projectRoot, filePath)}`);
      } else {
        await writeMarkdownPost(filePath, frontmatter, post.body);
        console.log(`synced ${locale} -> ${path.relative(projectRoot, filePath)}`);
      }

      writeCount += 1;
    }
  }

  if (writeCount === 0) {
    console.log('No published Feishu records matched the selected locale set.');
    return;
  }

  console.log(args.dryRun ? `Dry run complete: ${writeCount} file(s) would be updated.` : `Feishu sync complete: ${writeCount} file(s) updated.`);

  if (shouldTranslateEn) {
    await runEnglishTranslationSync(args);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('/drive/explorer/v2/folder/') && message.includes('forbidden')) {
    console.error(
      [
        message,
        'Hint: the Feishu app authenticated successfully, but it cannot read that Drive folder.',
        'If the folder is under my.feishu.cn personal drive, tenant_access_token usually cannot read it by default.',
        'You likely need one of these fixes:',
        '1. Move/share the docs into a space the app can access.',
        '2. Grant the app the required Drive/Docs scopes and re-authorize it in Feishu admin.',
        '3. Switch this integration to a user-access-token OAuth flow instead of app-only auth.'
      ].join('\n')
    );
    process.exitCode = 1;
    return;
  }

  console.error(message);
  process.exitCode = 1;
});
