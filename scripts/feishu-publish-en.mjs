import { randomUUID } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const enRoot = path.join(projectRoot, 'src', 'content', 'posts', 'en');
const manifestPath = path.join(projectRoot, 'memory', 'feishu-en-doc-manifest.json');
const paragraphBatchSize = 20;
const folderPageSize = 200;
const blockPageSize = 500;

async function loadDotenvFile(filePath) {
  try {
    const raw = await readFile(filePath, 'utf8');

    for (const line of raw.replace(/\r\n?/g, '\n').split('\n')) {
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
    key: flags.get('key')
  };
}

function parseScalar(rawValue) {
  const value = rawValue.trim();

  if (value.startsWith('"') && value.endsWith('"')) {
    return JSON.parse(value);
  }

  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'");
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
  const lines = block.replace(/\r\n?/g, '\n').split('\n');
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
    body: body.replace(/\r\n?/g, '\n').trimEnd()
  };
}

async function listMarkdownFiles(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.join(directoryPath, entry.name))
    .sort((left, right) => left.localeCompare(right));
}

async function loadEnglishPosts() {
  const filePaths = await listMarkdownFiles(enRoot);
  const posts = [];

  for (const filePath of filePaths) {
    const rawContent = await readFile(filePath, 'utf8');
    const post = parseMarkdownPost(rawContent, filePath);

    if (post.frontmatter.locale !== 'en') {
      throw new Error(`Expected locale "en" in ${filePath}`);
    }

    posts.push(post);
  }

  return posts;
}

async function loadManifest() {
  try {
    const raw = await readFile(manifestPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      return {};
    }

    throw error;
  }
}

async function saveManifest(manifest) {
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
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

function getNextPageToken(data) {
  if (!data?.has_more) {
    return undefined;
  }

  return data.next_page_token || data.page_token || undefined;
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

  async listFolderChildren(folderToken) {
    let pageToken;
    const items = [];

    do {
      const data = await this.request(`/open-apis/drive/explorer/v2/folder/${folderToken}/children`, {
        query: {
          page_size: folderPageSize,
          page_token: pageToken
        }
      });

      const directItems = data?.items || data?.files || Object.values(data?.children || {});
      items.push(...directItems);
      pageToken = getNextPageToken(data);
    } while (pageToken);

    return items.map((item) => ({
      token: item.token || item.file_token || item.obj_token,
      name: item.name || item.title,
      type: item.type || item.file_type || item.obj_type
    }));
  }

  async createDocument(folderToken, title) {
    const data = await this.request('/open-apis/docx/v1/documents', {
      method: 'POST',
      body: {
        folder_token: folderToken,
        title
      }
    });

    return data?.document;
  }

  async listBlockChildren(documentId, blockId) {
    let pageToken;
    const items = [];

    do {
      const data = await this.request(
        `/open-apis/docx/v1/documents/${documentId}/blocks/${blockId}/children`,
        {
          query: {
            page_size: blockPageSize,
            page_token: pageToken
          }
        }
      );

      items.push(...(data?.items || []));
      pageToken = getNextPageToken(data);
    } while (pageToken);

    return items;
  }

  async deleteDocumentChildren(documentId, count) {
    if (!count) {
      return;
    }

    await this.request(
      `/open-apis/docx/v1/documents/${documentId}/blocks/${documentId}/children/batch_delete`,
      {
        method: 'DELETE',
        query: {
          client_token: randomUUID()
        },
        body: {
          start_index: 0,
          end_index: count
        }
      }
    );
  }

  async appendParagraphBlocks(documentId, paragraphs) {
    for (let index = 0; index < paragraphs.length; index += paragraphBatchSize) {
      const chunk = paragraphs.slice(index, index + paragraphBatchSize);
      await this.request(`/open-apis/docx/v1/documents/${documentId}/blocks/${documentId}/children`, {
        method: 'POST',
        query: {
          client_token: randomUUID()
        },
        body: {
          index: index,
          children: chunk.map((paragraph) => ({
            block_type: 2,
            text: {
              elements: [
                {
                  text_run: {
                    content: paragraph
                  }
                }
              ],
              style: {}
            }
          }))
        }
      });
    }
  }
}

function buildEnHash(post) {
  return JSON.stringify({
    title: post.frontmatter.title,
    summary: post.frontmatter.summary,
    body: post.body
  });
}

function markdownToParagraphs(post) {
  const sections = `${post.frontmatter.summary}\n\n${post.body}`
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace(/\n+/g, '\n'));

  if (sections.length === 0) {
    throw new Error(`English post ${post.filePath} produced no publishable Feishu paragraphs.`);
  }

  return sections;
}

async function main() {
  await loadDotenvFile(path.join(projectRoot, '.env'));
  await loadDotenvFile(path.join(projectRoot, '.env.local'));

  const args = parseArguments(process.argv.slice(2));
  const client = new FeishuClient({
    baseUrl: process.env.FEISHU_OPEN_BASE_URL || 'https://open.feishu.cn',
    timeoutMs: Number.parseInt(process.env.FEISHU_SYNC_TIMEOUT_MS || '20000', 10),
    appId: getRequiredEnv('FEISHU_APP_ID'),
    appSecret: getRequiredEnv('FEISHU_APP_SECRET')
  });
  const folderToken = getRequiredEnv('FEISHU_DRIVE_EN_FOLDER_TOKEN');
  const posts = await loadEnglishPosts();
  const manifest = await loadManifest();
  const folderDocs = await client.listFolderChildren(folderToken);
  const docsByTitle = new Map(
    folderDocs
      .filter((item) => item.token && item.name && String(item.type).toLowerCase() === 'docx')
      .map((item) => [item.name, item])
  );

  let changedCount = 0;

  for (const post of posts) {
    const translationKey = post.frontmatter.translationKey;

    if (args.key && translationKey !== args.key) {
      continue;
    }

    const contentHash = buildEnHash(post);
    const existingRecord = manifest[translationKey];

    if (existingRecord?.contentHash === contentHash && existingRecord?.documentId) {
      continue;
    }

    let documentId = existingRecord?.documentId || docsByTitle.get(post.frontmatter.title)?.token;
    const paragraphs = markdownToParagraphs(post);

    if (!documentId) {
      if (args.dryRun) {
        console.log(`[dry-run] create en doc for ${translationKey} -> ${post.frontmatter.title}`);
        changedCount += 1;
        continue;
      }

      const created = await client.createDocument(folderToken, post.frontmatter.title);
      documentId = created?.document_id;

      if (!documentId) {
        throw new Error(`Failed to create Feishu document for ${translationKey}.`);
      }
    }

    if (args.dryRun) {
      console.log(`[dry-run] upsert en doc for ${translationKey} -> ${post.frontmatter.title}`);
      changedCount += 1;
      continue;
    }

    const childCount = (await client.listBlockChildren(documentId, documentId)).length;

    await client.deleteDocumentChildren(documentId, childCount);
    await client.appendParagraphBlocks(documentId, paragraphs);

    manifest[translationKey] = {
      documentId,
      title: post.frontmatter.title,
      contentHash,
      updatedAt: new Date().toISOString()
    };

    console.log(`published en doc ${translationKey} -> ${documentId}`);
    changedCount += 1;
  }

  if (!args.dryRun) {
    await saveManifest(manifest);
  }

  if (changedCount === 0) {
    console.log('no english Feishu docs needed updates');
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
