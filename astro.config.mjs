import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const owner = process.env.GITHUB_REPOSITORY_OWNER ?? '';
const isProjectPagesRepo = Boolean(
  repository && owner && repository !== `${owner}.github.io`
);

const site = process.env.SITE_URL ?? (owner ? `https://${owner}.github.io` : 'https://example.com');
const base = process.env.BASE_PATH ?? (isProjectPagesRepo ? `/${repository}` : '/');

export default defineConfig({
  output: 'static',
  site,
  ...(base !== '/' ? { base } : {}),
  trailingSlash: 'always',
  integrations: [sitemap()]
});
