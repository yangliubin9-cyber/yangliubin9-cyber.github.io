import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const postsRoot = path.join(projectRoot, 'src', 'content', 'posts');
const zhRoot = path.join(postsRoot, 'zh');
const enRoot = path.join(postsRoot, 'en');
const defaultModel = process.env.OPENAI_TRANSLATION_MODEL || 'gpt-5.4-mini';
const translationStatuses = {
  aiGenerated: 'ai-generated',
  reviewed: 'reviewed',
  needsUpdate: 'needs-update'
};
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
const translationSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'summary', 'body'],
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    body: { type: 'string' }
  }
};

function resolveOpenAIEndpoint() {
  const configuredBaseUrl = process.env.OPENAI_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    return 'https://api.openai.com/v1/responses';
  }

  const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, '');

  if (normalizedBaseUrl.endsWith('/responses')) {
    return normalizedBaseUrl;
  }

  if (normalizedBaseUrl.endsWith('/v1')) {
    return `${normalizedBaseUrl}/responses`;
  }

  return `${normalizedBaseUrl}/v1/responses`;
}

function parseArguments(argv) {
  const [command, ...rest] = argv;
  const flags = new Map();

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];

    if (!token.startsWith('--')) {
      continue;
    }

    if (token.includes('=')) {
      const [key, value] = token.slice(2).split(/=(.*)/s, 2);
      flags.set(key, value);
      continue;
    }

    const next = rest[index + 1];
    if (!next || next.startsWith('--')) {
      flags.set(token.slice(2), true);
      continue;
    }

    flags.set(token.slice(2), next);
    index += 1;
  }

  return {
    command,
    key: flags.get('key'),
    model: flags.get('model') || defaultModel,
    force: Boolean(flags.get('force') || flags.get('force-reviewed')),
    all: Boolean(flags.get('all'))
  };
}

function normalizeLineEndings(value) {
  return value.replace(/\r\n?/g, '\n');
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
  const root = locale === 'zh' ? zhRoot : enRoot;
  const filePaths = await listMarkdownFiles(root);
  const posts = [];

  for (const filePath of filePaths) {
    const rawContent = await readFile(filePath, 'utf8');
    posts.push(parseMarkdownPost(rawContent, filePath));
  }

  return posts;
}

function createPostMap(posts, locale) {
  const byKey = new Map();

  for (const post of posts) {
    const translationKey = post.frontmatter.translationKey;
    if (typeof translationKey !== 'string' || !translationKey) {
      throw new Error(`Missing translationKey in ${post.filePath}`);
    }

    if (post.frontmatter.locale !== locale) {
      throw new Error(`Expected locale "${locale}" in ${post.filePath}`);
    }

    if (byKey.has(translationKey)) {
      throw new Error(`Duplicate ${locale} translationKey "${translationKey}"`);
    }

    byKey.set(translationKey, post);
  }

  return byKey;
}

function buildSourceHash(post) {
  const payload = {
    translationKey: post.frontmatter.translationKey,
    pathSlug: post.frontmatter.pathSlug,
    title: post.frontmatter.title,
    summary: post.frontmatter.summary,
    publishedAt: post.frontmatter.publishedAt,
    updatedAt: post.frontmatter.updatedAt,
    readingMinutes: post.frontmatter.readingMinutes,
    series: post.frontmatter.series,
    seriesOrder: post.frontmatter.seriesOrder,
    featured: post.frontmatter.featured,
    tags: post.frontmatter.tags ?? [],
    body: post.body
  };

  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function getTranslationState(zhPost, enPost) {
  const sourceHash = buildSourceHash(zhPost);

  if (!enPost) {
    return { kind: 'missing', sourceHash };
  }

  const storedHash = enPost.frontmatter.translationSourceHash;
  const storedStatus = enPost.frontmatter.translationStatus;
  const inSync = typeof storedHash === 'string' && storedHash === sourceHash;

  if (!storedHash || !storedStatus) {
    return { kind: 'untracked', sourceHash };
  }

  if (inSync) {
    return {
      kind: storedStatus === translationStatuses.reviewed ? 'synced-reviewed' : 'synced-ai',
      sourceHash
    };
  }

  return {
    kind: storedStatus === translationStatuses.reviewed ? 'stale-reviewed' : 'stale-ai',
    sourceHash
  };
}

function serializeScalar(value) {
  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }

  if (typeof value !== 'string') {
    throw new Error(`Unsupported scalar value: ${String(value)}`);
  }

  if (/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(value)) {
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

function formatDateStamp() {
  return new Date().toISOString().slice(0, 10);
}

async function writeMarkdownPost(filePath, frontmatter, body) {
  const serialized = `${serializeFrontmatter(frontmatter)}\n${body.trim()}\n`;
  await writeFile(filePath, serialized, 'utf8');
}

function buildEnglishFrontmatter(zhPost, translated, sourceHash, model) {
  return {
    locale: 'en',
    translationKey: zhPost.frontmatter.translationKey,
    pathSlug: zhPost.frontmatter.pathSlug,
    title: translated.title.trim(),
    summary: translated.summary.trim(),
    publishedAt: zhPost.frontmatter.publishedAt,
    updatedAt: zhPost.frontmatter.updatedAt,
    readingMinutes: zhPost.frontmatter.readingMinutes,
    series: zhPost.frontmatter.series,
    seriesOrder: zhPost.frontmatter.seriesOrder,
    featured: zhPost.frontmatter.featured,
    tags: zhPost.frontmatter.tags ?? [],
    translationSourceHash: sourceHash,
    translationStatus: translationStatuses.aiGenerated,
    translationModel: model,
    translationUpdatedAt: formatDateStamp()
  };
}

function extractOutputText(responseJson) {
  if (typeof responseJson.output_text === 'string' && responseJson.output_text.trim()) {
    return responseJson.output_text;
  }

  const outputParts = [];

  for (const item of responseJson.output ?? []) {
    for (const content of item.content ?? []) {
      const textValue = content.text ?? content.output_text;

      if (typeof textValue === 'string' && textValue.trim()) {
        outputParts.push(textValue);
      }
    }
  }

  return outputParts.join('\n').trim();
}

function validateTranslationPayload(payload) {
  if (
    !payload ||
    typeof payload !== 'object' ||
    typeof payload.title !== 'string' ||
    typeof payload.summary !== 'string' ||
    typeof payload.body !== 'string'
  ) {
    throw new Error('OpenAI response did not match the expected translation payload.');
  }

  return payload;
}

async function requestTranslation(zhPost, model) {
  const apiKey = process.env.OPENAI_API_KEY;
  const openaiEndpoint = resolveOpenAIEndpoint();

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY. Set it before running translation commands.');
  }

  const systemPrompt = [
    'You translate Chinese technical blog posts into concise, natural English for engineers.',
    'Preserve markdown structure, heading hierarchy, lists, links, code fences, inline code, and commands.',
    'Do not invent facts, examples, commands, or configuration values that are not present in the source.',
    'Keep the tone practical and direct.',
    'Only translate title, summary, and body.'
  ].join(' ');

  const userPrompt = JSON.stringify(
    {
      translationKey: zhPost.frontmatter.translationKey,
      pathSlug: zhPost.frontmatter.pathSlug,
      source: {
        title: zhPost.frontmatter.title,
        summary: zhPost.frontmatter.summary,
        body: zhPost.body
      }
    },
    null,
    2
  );

  const response = await fetch(openaiEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      reasoning: {
        effort: 'low'
      },
      temperature: 0.2,
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: systemPrompt }]
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: userPrompt }]
        }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'translation_result',
          schema: translationSchema,
          strict: true
        }
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errorText}`);
  }

  const responseJson = await response.json();
  const outputText = extractOutputText(responseJson);

  if (!outputText) {
    throw new Error('OpenAI returned no translation output.');
  }

  return validateTranslationPayload(JSON.parse(outputText));
}

async function loadContentState() {
  const zhPosts = await loadLocalePosts('zh');
  const enPosts = await loadLocalePosts('en');

  return {
    zhByKey: createPostMap(zhPosts, 'zh'),
    enByKey: createPostMap(enPosts, 'en')
  };
}

function printStateLine(translationKey, state) {
  const labels = {
    missing: 'missing en file',
    untracked: 'existing en file has no sync metadata',
    'synced-ai': 'ai generated and in sync',
    'synced-reviewed': 'reviewed and in sync',
    'stale-ai': 'ai generated but source changed',
    'stale-reviewed': 'reviewed english is stale'
  };

  console.log(`${translationKey}: ${labels[state.kind]}`);
}

async function translateSinglePair(translationKey, zhPost, enPost, options) {
  const state = getTranslationState(zhPost, enPost);
  const protectedStates = new Set(['untracked', 'stale-reviewed', 'synced-reviewed']);

  if (protectedStates.has(state.kind) && !options.force) {
    throw new Error(
      `${translationKey} is protected (${state.kind}). Use --force-reviewed to overwrite it.`
    );
  }

  const translated = await requestTranslation(zhPost, options.model);
  const nextFrontmatter = buildEnglishFrontmatter(zhPost, translated, state.sourceHash, options.model);
  const outputPath = path.join(enRoot, `${zhPost.frontmatter.pathSlug}.md`);

  await writeMarkdownPost(outputPath, nextFrontmatter, translated.body);
  console.log(`translated ${translationKey} -> ${path.relative(projectRoot, outputPath)}`);
}

async function runTranslateOne(options) {
  if (!options.key) {
    throw new Error('translate:one requires --key <translationKey>.');
  }

  const { zhByKey, enByKey } = await loadContentState();
  const zhPost = zhByKey.get(options.key);

  if (!zhPost) {
    throw new Error(`Could not find zh post for translationKey "${options.key}".`);
  }

  await translateSinglePair(options.key, zhPost, enByKey.get(options.key), options);
}

async function runTranslateChanged(options) {
  const { zhByKey, enByKey } = await loadContentState();
  let translatedCount = 0;

  for (const [translationKey, zhPost] of zhByKey.entries()) {
    const enPost = enByKey.get(translationKey);
    const state = getTranslationState(zhPost, enPost);

    if (state.kind === 'synced-ai' || state.kind === 'synced-reviewed') {
      continue;
    }

    if ((state.kind === 'untracked' || state.kind === 'stale-reviewed') && !options.force) {
      console.log(`skip ${translationKey}: ${state.kind}, kept for manual review`);
      continue;
    }

    await translateSinglePair(translationKey, zhPost, enPost, options);
    translatedCount += 1;
  }

  if (translatedCount === 0) {
    console.log('no pending translations');
  }
}

async function runTranslateCheck() {
  const { zhByKey, enByKey } = await loadContentState();
  let hasPendingWork = false;

  for (const [translationKey, zhPost] of zhByKey.entries()) {
    const state = getTranslationState(zhPost, enByKey.get(translationKey));
    printStateLine(translationKey, state);

    if (state.kind !== 'synced-ai' && state.kind !== 'synced-reviewed') {
      hasPendingWork = true;
    }
  }

  if (hasPendingWork) {
    process.exitCode = 1;
  }
}

async function markReviewedPair(translationKey, zhPost, enPost) {
  if (!enPost) {
    throw new Error(`Cannot review ${translationKey} because the en file does not exist.`);
  }

  const sourceHash = buildSourceHash(zhPost);
  const nextFrontmatter = {
    ...enPost.frontmatter,
    translationSourceHash: sourceHash,
    translationStatus: translationStatuses.reviewed,
    translationModel: enPost.frontmatter.translationModel || 'manual',
    translationUpdatedAt: enPost.frontmatter.translationUpdatedAt || formatDateStamp()
  };

  await writeMarkdownPost(enPost.filePath, nextFrontmatter, enPost.body);
  console.log(`marked reviewed: ${translationKey}`);
}

async function runTranslateReview(options) {
  const { zhByKey, enByKey } = await loadContentState();

  if (options.all) {
    for (const [translationKey, zhPost] of zhByKey.entries()) {
      const enPost = enByKey.get(translationKey);

      if (!enPost) {
        console.log(`skip ${translationKey}: missing en file`);
        continue;
      }

      await markReviewedPair(translationKey, zhPost, enPost);
    }

    return;
  }

  if (!options.key) {
    throw new Error('translate:review requires --key <translationKey> or --all.');
  }

  const zhPost = zhByKey.get(options.key);
  if (!zhPost) {
    throw new Error(`Could not find zh post for translationKey "${options.key}".`);
  }

  await markReviewedPair(options.key, zhPost, enByKey.get(options.key));
}

async function main() {
  const options = parseArguments(process.argv.slice(2));

  switch (options.command) {
    case 'one':
      await runTranslateOne(options);
      return;
    case 'changed':
      await runTranslateChanged(options);
      return;
    case 'check':
      await runTranslateCheck();
      return;
    case 'review':
      await runTranslateReview(options);
      return;
    default:
      throw new Error('Unknown command. Use one, changed, check, or review.');
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
