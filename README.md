# Yang's Blogs

`Yang's Blogs` is a bilingual personal tech blog built with Astro.

Live site: [yangliubin9-cyber.github.io](https://yangliubin9-cyber.github.io/)

Current focus:

- Chinese-first bilingual routing, `zh` and `en`
- Static pages deployed with GitHub Pages
- Seed content for AI infrastructure, MLOps, Kubernetes, Docker, and engineering practice
- A clean blog skeleton that is easy to extend before wiring in external systems

## Current Status

This repository is now the source of truth for the new blog site.

What is already in place:

- Astro static site scaffold
- Root `/` redirect to `/zh/`
- Bilingual route structure for home, about, search, article, series, login, and register pages
- Seed article and series data in the codebase
- GitHub Actions workflow for GitHub Pages deployment

What is not integrated yet:

- Feishu content sync
- Real search indexing
- User authentication backend

What is already wired in for comments:

- Comment repo: [Blogs-Comment](https://github.com/yangliubin9-cyber/Blogs-Comment)
- Comment provider: `utterances`
- Comment storage: GitHub Issues in the comment repo
- Current scope: article pages only

Comment posting currently requires a GitHub account.

Feishu sync stays for later, after the blog shell and comment path are stable.

## Tech Stack

- Astro 6
- TypeScript
- `@astrojs/sitemap`
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
- `/zh/auth/login/` and `/en/auth/login/`
- `/zh/auth/register/` and `/en/auth/register/`

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
|-- src/
|   |-- data/
|   |-- layouts/
|   |-- lib/
|   `-- pages/
|-- astro.config.mjs
|-- package.json
`-- PLAN.md
```

Key files:

- [`src/data/site.ts`](./src/data/site.ts): site metadata, seed series, and seed articles
- [`src/pages`](./src/pages): bilingual route pages
- [`astro.config.mjs`](./astro.config.mjs): Astro site and base-path config
- [`PLAN.md`](./PLAN.md): the longer product and architecture plan

## Roadmap

Near-term:

1. Replace seed article data with a real content source
2. Add real search
3. Refine the comment UX and moderation path

Later:

1. Add Feishu manual sync
2. Introduce publishing workflow and content transformation
3. Replace GitHub-backed comments with a deeper custom auth and moderation flow if needed
