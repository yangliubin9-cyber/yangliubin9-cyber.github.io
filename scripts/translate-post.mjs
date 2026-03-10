import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

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

await loadEnvFile(path.join(process.cwd(), '.env.local'));
await loadEnvFile(path.join(process.cwd(), '.env'));

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg.split('=');
    return [key.replace(/^--/, ''), value ?? 'true'];
  })
);

if (!args.source) {
  console.error('Usage: npm run translate:post -- --source=src/content/posts/zh/post.mdx [--target=src/content/posts/en/post.mdx] [--write=true]');
  process.exit(1);
}

const sourcePath = path.resolve(process.cwd(), args.source);
const targetPath = path.resolve(process.cwd(), args.target ?? args.source.replace('/zh/', '/en/'));
const source = await readFile(sourcePath, 'utf8');
const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

if (!match) throw new Error('Source file must contain frontmatter.');

const frontmatter = parseFrontmatter(match[1]);
const body = match[2].trim();
const style = process.env.AI_TRANSLATION_API_STYLE ?? 'anthropic';
const baseUrl = (process.env.AI_TRANSLATION_BASE_URL ?? '').replace(/\/$/, '');
const apiKey = process.env.AI_TRANSLATION_API_KEY ?? '';
const model = process.env.AI_TRANSLATION_MODEL ?? 'glm-5';

if (!baseUrl || !apiKey || !model) {
  throw new Error('Missing AI translation environment config. Check .env.local or .env.example');
}

const prompt = [
  'You are translating a Chinese developer blog post into polished natural English.',
  'Return strict JSON with keys: title, excerpt, category, tags, heroEyebrow, body.',
  'Preserve meaning, structure, technical correctness, and calm editorial tone.',
  'For body, return Markdown/MDX only without frontmatter.',
  '',
  'SOURCE FRONTMATTER:',
  JSON.stringify(frontmatter, null, 2),
  '',
  'SOURCE BODY:',
  body
].join('\n');

const text = style === 'openai'
  ? await callOpenAI(baseUrl, apiKey, model, prompt)
  : await callAnthropic(baseUrl, apiKey, model, prompt);

const translated = JSON.parse(extractJson(text));
const nextFrontmatter = {
  pathSlug: frontmatter.pathSlug,
  locale: 'en',
  translationKey: frontmatter.translationKey,
  title: translated.title,
  excerpt: translated.excerpt,
  category: translated.category,
  publishedAt: frontmatter.publishedAt,
  featured: frontmatter.featured,
  tags: translated.tags,
  accent: frontmatter.accent,
  heroEyebrow: translated.heroEyebrow || frontmatter.heroEyebrow || 'Workflow'
};

const output = stringifyFrontmatter(nextFrontmatter) + '\n\n' + translated.body.trim() + '\n';

if (args.write === 'true' || args.write === '1') {
  await writeFile(targetPath, output, 'utf8');
  console.log(`Translated file written to ${targetPath}`);
} else {
  console.log(output);
}

function parseFrontmatter(input) {
  const lines = input.split(/\r?\n/);
  const result = {};
  let currentArrayKey = '';

  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.startsWith('  - ') && currentArrayKey) {
      result[currentArrayKey].push(line.replace('  - ', '').trim());
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
    else result[key] = rawValue;
  }

  return result;
}

function stringifyFrontmatter(data) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) lines.push(`  - ${item}`);
      continue;
    }
    lines.push(`${key}: ${value}`);
  }
  lines.push('---');
  return lines.join('\n');
}

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Model did not return JSON.');
  return match[0];
}

async function callAnthropic(baseUrl, apiKey, model, prompt) {
  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) throw new Error(`Anthropic-compatible request failed: ${response.status} ${await response.text()}`);
  const data = await response.json();
  return data.content?.map((item) => item.text).join('\n') ?? '';
}

async function callOpenAI(baseUrl, apiKey, model, prompt) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'Translate Chinese developer blog posts into natural English JSON.' },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) throw new Error(`OpenAI-compatible request failed: ${response.status} ${await response.text()}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}