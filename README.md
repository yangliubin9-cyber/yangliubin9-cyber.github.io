# Yang's Blogs

`Yang's Blogs` is a bilingual personal tech blog built with Astro.

Live site: [yangliubin9-cyber.github.io](https://yangliubin9-cyber.github.io/)

Current focus:

- Chinese-first bilingual routing, `zh` and `en`
- Static pages deployed with GitHub Pages
- Local Markdown content collections for AI infrastructure, MLOps, Kubernetes, Docker, and engineering practice
- A practical blog shell with real article pages, series pages, in-page search, and site-wide language/theme controls

## Current Status

This repository is now the source of truth for the new blog site.

What is already in place:

- Astro static site scaffold
- Root `/` redirect to `/zh/`
- Bilingual route structure for home, about, search, article, and series pages
- Site-wide `ZH/EN` language switch in the header
- Persistent light and dark theme toggle across public pages
- Real bilingual article content stored in Astro content collections
- Home page reduced to brand intro plus curated featured articles
- Working article pages with Markdown rendering, table of contents, tags, related post links, and series navigation
- Search page with instant client-side filtering, series chips, result counts, and reset controls
- GitHub Actions workflow for GitHub Pages deployment

What is not integrated yet:

- Feishu content sync
- User authentication backend

Legacy auth URLs are kept only as silent redirect routes back to the locale home page. They are not public product pages.

What is already wired in for comments:

- Comment repo: [Blogs-Comment](https://github.com/yangliubin9-cyber/Blogs-Comment)
- Comment provider: `utterances`
- Comment storage: GitHub Issues in the comment repo
- Current scope: article pages only

Comment posting currently requires a GitHub account.

Feishu sync stays for later, after the blog shell and comment path are stable.

Current content source:

- `src/content/posts/zh/*.md`
- `src/content/posts/en/*.md`
- `src/content.config.ts`
- `src/content/templates/*.md`
- `CONTENT_GUIDE.md`
- `scripts/translate-posts.mjs`

## Content Workflow

The site now uses an explicit bilingual content model.

Required post fields now include:

- `translationKey`: the zh/en pairing key
- `pathSlug`: the public route slug
- `seriesOrder`: the explicit order inside a series

Current publishing rules:

- `zh` is the source of truth
- `en` is a derived translation that can be created later
- `en` must never exist without a matching `zh`
- both locale files must share the same `translationKey`
- if an `en` file exists, it must share the same `pathSlug`
- if an `en` file exists, it must stay in the same `series`
- if an `en` file exists, it must use the same `seriesOrder`

Translation metadata for English files:

- `translationSourceHash`: hash of the current Chinese source snapshot
- `translationStatus`: `ai-generated`, `reviewed`, or reserved `needs-update`
- `translationModel`: the model used for the last machine translation
- `translationUpdatedAt`: last machine-sync date

Recommended translation flow:

1. Write or update the Chinese post under `src/content/posts/zh/`
2. Generate or refresh English with `npm run translate:one -- --key your-key` or `npm run translate:changed`
3. Review the English content manually
4. Mark it as reviewed with `npm run translate:review -- --key your-key`
5. Run `npm run translate:check`, `npm run check`, and `npm run build`

Environment variables for translation:

- `OPENAI_API_KEY`: required for translation requests
- `OPENAI_TRANSLATION_MODEL`: optional, defaults to `gpt-5.4-mini`

Useful translation commands:

```bash
npm run translate:one -- --key linux-basic
npm run translate:changed
npm run translate:check
npm run translate:review -- --key linux-basic
npm run translate:review -- --all
```

If you already have hand-written English files from before this workflow existed, run `npm run translate:review -- --all` once to baseline them as reviewed translations without overwriting the content.

Use these authoring references before adding new posts:

- [`CONTENT_GUIDE.md`](./CONTENT_GUIDE.md)
- [`src/content/templates/post.zh.template.md`](./src/content/templates/post.zh.template.md)
- [`src/content/templates/post.en.template.md`](./src/content/templates/post.en.template.md)

## Tech Stack

- Astro 6
- TypeScript
- `@astrojs/sitemap`
- Astro content collections
- GitHub Pages

## Route Structure

Current route layout:

- `/` -> redirects to `/zh/`
- `/zh/` and `/en/`
- `/zh/about/` and `/en/about/`
- `/zh/search/` and `/en/search/`
- `/zh/series/` and `/en/series/`
- `/zh/series/[series_slug]/` and `/en/series/[series_slug]/`
- `/zh/[slug]/` and `/en/[slug]/`

Legacy redirect-only routes:

- `/zh/auth/login/` and `/en/auth/login/` -> locale home
- `/zh/auth/register/` and `/en/auth/register/` -> locale home

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Run type and Astro checks:

```bash
npm run check
```

Build the static site:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

If you are running inside a restricted Windows or sandboxed environment and Astro telemetry throws an `EPERM` error, run commands with telemetry disabled:

```powershell
$env:ASTRO_TELEMETRY_DISABLED='1'; npm.cmd run build
```

## Deployment

This repo deploys through GitHub Actions.

Workflow file:

- [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)

Behavior:

- push to `main`
- GitHub Actions builds the Astro site
- GitHub Pages publishes the result automatically

## Comment Verification

Use this page as a quick production test:

- [https://yangliubin9-cyber.github.io/zh/linux-basic/](https://yangliubin9-cyber.github.io/zh/linux-basic/)

Expected behavior:

1. Open an article page and scroll to the bottom
2. The comment section should render under the article body
3. Sign in with GitHub if prompted
4. Post a comment
5. The first comment for a new article should create a matching GitHub issue in `Blogs-Comment`

The issue term is based on the article slug, for example:

- `blog-post:linux-basic`
- `blog-post:docker-basic`
- `blog-post:k8s`

## Comment Troubleshooting

If the comment box does not appear:

1. Confirm the page is an article page, not the home page or series page
2. Hard refresh the browser to clear cached HTML and scripts
3. Confirm `Blogs-Comment` is public
4. Confirm `Blogs-Comment` has Issues enabled
5. Confirm the `utterances` GitHub App is installed for `Blogs-Comment`

If the comment box appears but posting fails:

1. Confirm you are signed in to GitHub
2. Confirm GitHub did not block the authorization popup
3. Open the `Blogs-Comment` Issues tab and check whether the issue thread was created

## Project Structure

```text
.
|-- public/
|-- scripts/
|-- src/
|   |-- content/
|   |-- content.config.ts
|   |-- data/
|   |-- layouts/
|   |-- lib/
|   `-- pages/
|-- astro.config.mjs
|-- package.json
`-- PLAN.md
```

Key files:

- [`src/content.config.ts`](./src/content.config.ts): content collection schema
- [`src/content/posts`](./src/content/posts): bilingual Markdown article source
- [`src/data/site.ts`](./src/data/site.ts): site metadata and series definitions
- [`src/lib/content.ts`](./src/lib/content.ts): content query helpers for pages
- [`src/pages`](./src/pages): bilingual route pages
- [`astro.config.mjs`](./astro.config.mjs): Astro site and base-path config
- [`PLAN.md`](./PLAN.md): the longer product and architecture plan

## Roadmap

Near-term:

1. Expand the article catalog and polish article navigation
2. Upgrade the current instant search to Pagefind if the archive grows
3. Add Feishu manual sync without breaking the local content fallback

Later:

1. Introduce publishing workflow and content transformation
2. Replace GitHub-backed comments with a deeper custom auth and moderation flow if needed
3. Decide whether a real account system is worth adding later, instead of keeping auth out of scope
