import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

/** `/` for https://mptour.github.io, `/mptour` while the repo is still a project site. */
export function resolveBase(raw = process.env.BASE_PATH ?? '/') {
  const value = raw.trim() || '/';
  if (value === '/') return '/';
  return `/${value.replace(/^\/+|\/+$/g, '')}`;
}

export default defineConfig({
  site: 'https://mptour.github.io',
  base: resolveBase(),
  trailingSlash: 'always',
  outDir: process.env.OUT_DIR || 'dist',
  build: {
    assets: 'assets',
  },
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const { pathname } = new URL(page);
        return (
          pathname === '/' ||
          pathname === '/es/' ||
          pathname === '/en/' ||
          pathname === '/mptour/' ||
          pathname === '/mptour/es/' ||
          pathname === '/mptour/en/'
        );
      },
    }),
  ],
});
