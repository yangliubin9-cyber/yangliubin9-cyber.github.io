# Yang’s Log / 杨刘彬·言

A bilingual personal blog built with Astro for GitHub Pages.

## Included features

- `https://yangliubin9-cyber.github.io/zh` and `https://yangliubin9-cyber.github.io/en`
- Home, Blog, About, Projects, Uses, and Contact pages
- Light and dark theme switching with local persistence
- Markdown and MDX article support
- Blog category filters, tag filters, and local static search
- GitHub Pages deployment via GitHub Actions
- SEO essentials: sitemap, Open Graph metadata, and localized page titles
- giscus comment area scaffold for GitHub Discussions

## Content model

Posts live in `src/content/posts/{zh,en}` and use Astro content collections.

Frontmatter fields:

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

## Comments setup

To enable giscus comments, fill these values in `src/lib/site.ts` after enabling GitHub Discussions:

- `SITE.giscus.repoId`
- `SITE.giscus.categoryId`

You can generate them at [giscus.app](https://giscus.app).

## Local development

```bash
npm install
npm run dev
```

## Deployment

1. Push to the `main` branch of `yangliubin9-cyber.github.io`
2. In GitHub `Settings > Pages`, choose `GitHub Actions`
3. The workflow in `.github/workflows/deploy.yml` will build and publish automatically

## Notes

- The current avatar is an original sponge-inspired SVG so the public repo stays free and safe to publish.
- Replace `public/avatar-sponge.svg` later if you want to swap in your own authorized image.