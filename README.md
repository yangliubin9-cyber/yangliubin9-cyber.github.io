# Yang Liubin Blog

A bilingual personal blog built with Astro for GitHub Pages.

## What is included

- Static-first architecture for `yangliubin9-cyber.github.io`
- Simplified Chinese and English routes
- Light and dark theme switch with local persistence
- MDX-powered blog posts with a clean content workflow
- GitHub Actions deployment to GitHub Pages

## Design Direction

This project intentionally avoids generic AI-generated blog aesthetics.

- Typography: `Manrope` for a crisp, modern reading rhythm and `IBM Plex Mono` for interface details.
- Visual language: soft grid textures, layered radial gradients, and restrained glass surfaces to create a premium technology feel without looking noisy.
- Layout: large negative space, compact navigation, and editorial cards so the site feels closer to a product landing page than a template blog.
- Interaction: only a few meaningful motions are used, focused on page entrance, hover clarity, and smooth theme transitions.

## Local development

```bash
npm install
npm run dev
```

## Content authoring

Blog posts live in:

- `src/content/posts/zh`
- `src/content/posts/en`

Each article has a localized MDX file. To create a new bilingual post, duplicate one pair of existing files and keep the same `translationKey` and `slug`.

## Deploy to GitHub Pages

1. Push this project to the `main` branch of `yangliubin9-cyber.github.io`.
2. In GitHub repository settings, open `Settings > Pages`.
3. Set the source to `GitHub Actions`.
4. Push again or run the `Deploy Astro Site` workflow manually.

## Notes

- The repository name already matches the GitHub Pages user-site convention, so no subpath base is required.
- The homepage will open at `https://yangliubin9-cyber.github.io`.
