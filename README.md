# Yang’s Log / 杨刘彬·言

A bilingual personal blog and portfolio built with Astro for GitHub Pages.

## Features

- `https://yangliubin9-cyber.github.io/zh` and `https://yangliubin9-cyber.github.io/en`
- Home, Blog, Search, About, Projects, Uses, Contact, and Studio pages
- Light and dark theme switching with local persistence
- Markdown and MDX post support
- Root-level post routes: `/zh/<slug>` and `/en/<slug>`
- Cross-language local search on the blog index and a dedicated search page
- Table of contents, adjacent post navigation, related posts, and giscus comments
- GitHub Actions deployment for GitHub Pages
- SEO essentials: sitemap, Open Graph metadata, and localized titles
- Local visual writing studio that exports Markdown / MDX drafts
- Decap CMS admin entry for free local visual editing
- OpenAI-compatible translation script for Chinese-to-English post generation
- Nightly Feishu Docs sync into blog content files

## Content model

Posts live in `src/content/posts/{zh,en}` and use Astro content collections.

Frontmatter fields:

- `pathSlug`
- `locale`
- `translationKey`
- `title`
- `excerpt`
- `category`
- `publishedAt`
- `updatedAt` (optional)
- `featured`
- `tags`
- `accent`
- heroEyebrow (optional)
- sourcePlatform (optional)
- sourceUrl (optional)

## Avatar

Place your avatar at the project root as one of these filenames:

- `Avatar.jpg`
- `Avatar.jpeg`
- `Avatar.png`
- `Avatar.webp`

The `sync:assets` script will copy it to `public/Avatar.jpg` automatically before `dev` and `build`.
If no avatar file is found, the site falls back to `public/avatar-sponge.svg`.

## Comments setup

The site points to the dedicated comments repository:

- `yangliubin9-cyber/Blogs-Comment`

If you ever need to update the giscus wiring, the active values live in `src/lib/site.ts`.

## Search

You can search in two ways:

- Blog index filtering: `/zh/blog/` or `/en/blog/`
- Dedicated search page: `/zh/search/` or `/en/search/`

Both search surfaces work entirely on the client with no paid API or external search service.

## Visual editing

### Built-in Studio

The built-in Studio lives at:

- `/zh/studio/`
- `/en/studio/`

It is best for MDX-friendly drafting, frontmatter generation, and bilingual writing workflows.

### Decap CMS

The Decap admin entry lives at:

- `/admin/`

This repository is configured for a free local editing workflow on top of GitHub Pages.
Because GitHub Pages does not provide a built-in OAuth callback for Decap, the recommended way to use it is locally:

```bash
npm install
npm run dev
npm run cms:proxy
```

Then open:

- `http://localhost:4321/admin/`

This lets you visually edit post frontmatter and Markdown content for free. For advanced MDX components, continue using the built-in Studio or your code editor.


## Feishu sync

If you prefer writing in Feishu and publishing through GitHub Pages, this repo can pull your Feishu Docs into `src/content/posts` automatically.

### What it does

- Treats Feishu Docs as the writing source
- Generates or updates local blog post files every night
- Commits synced content back to `main`
- Lets the normal Pages deploy workflow publish the new version

### Schedule

- GitHub Actions runs the Feishu sync workflow at `02:00` every day in `Asia/Shanghai`
- Because GitHub cron uses UTC, the workflow uses `0 18 * * *`

### Configuration

1. Add your sources in `feishu-sync.config.mjs`
2. Add these GitHub Actions secrets to `yangliubin9-cyber.github.io`

```bash
FEISHU_OPEN_BASE_URL=https://open.feishu.cn
FEISHU_APP_ID=your_feishu_app_id
FEISHU_APP_SECRET=your_feishu_app_secret
```

3. Trigger the workflow manually once from GitHub Actions, or wait for the nightly run

The current syncer is designed for Feishu `docx` document URLs first. If your source is a wiki page instead of a `docx` link, keep the same config structure and add `documentToken` manually for now.

### Local test

```bash
npm run sync:feishu
```

After sync finishes, run:

```bash
npm run build
```
## AI translation

The local translation script is at `scripts/translate-post.mjs`.
It reads `.env.local` or `.env` and supports OpenAI-compatible and Anthropic-compatible APIs.

Example:

```bash
npm run translate:post -- --source=src/content/posts/zh/personal-infrastructure.mdx --write=true
```

Environment template:

```bash
AI_TRANSLATION_API_STYLE=anthropic
AI_TRANSLATION_BASE_URL=https://open.bigmodel.cn/api/anthropic
AI_TRANSLATION_API_KEY=your_api_key_here
AI_TRANSLATION_MODEL=glm-5
```

## Local development

```bash
npm install
npm run dev
```

## Deployment

1. Push to the `main` branch of `yangliubin9-cyber.github.io`.
2. In GitHub `Settings > Pages`, choose `GitHub Actions`.
3. The workflow in `.github/workflows/deploy.yml` will build and publish automatically.
