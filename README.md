# Yang’s Log / 杨刘彬·言

A bilingual personal blog and portfolio built with Astro for GitHub Pages.

## Features

- `https://yangliubin9-cyber.github.io/zh` and `https://yangliubin9-cyber.github.io/en`
- Home, Blog, About, Projects, Uses, Contact, and Studio pages
- Light and dark theme switching with local persistence
- Markdown and MDX post support
- Root-level post routes: `/zh/<slug>` and `/en/<slug>`
- Cross-language local search, category filters, and tag filters
- GitHub Discussions comments scaffold via giscus
- GitHub Actions deployment for GitHub Pages
- SEO essentials: sitemap, Open Graph metadata, and localized titles
- Local visual writing studio that exports Markdown / MDX drafts
- OpenAI-compatible translation script for Chinese-to-English post generation

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
- `heroEyebrow` (optional)

## Avatar

Place your avatar at the project root as one of these filenames:

- `Avatar.jpg`
- `Avatar.jpeg`
- `Avatar.png`
- `Avatar.webp`

The `sync:assets` script will copy it to `public/Avatar.jpg` automatically before `dev` and `build`.
If no avatar file is found, the site falls back to `public/avatar-sponge.svg`.

## Comments setup

The site is already pointed at the dedicated comments repository:

- `yangliubin9-cyber/Blogs-Comment`

To enable giscus comments, do this:

1. Enable GitHub Discussions on the `Blogs-Comment` repository.
2. Create the categories you want to use, such as `General`, `Ideas`, `Q&A`, and `Showcase`.
3. Generate the giscus config values at [giscus.app](https://giscus.app).
4. Fill in `SITE.giscus.repoId` and `SITE.giscus.categoryId` in `src/lib/site.ts`.

## AI translation

The local translation script is at `scripts/translate-post.mjs`.
It reads `.env.local` or `.env` and supports OpenAI-compatible and Anthropic-compatible APIs.

Example:

```bash
npm run translate:post -- --source=src/content/posts/zh/ai-translation-workflows.mdx --write=true
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
