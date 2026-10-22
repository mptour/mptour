import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const sitemap = new URL(
    `${import.meta.env.BASE_URL}sitemap-index.xml`,
    'https://mptour.github.io',
  );
  const body = `User-agent: *\nAllow: /\nSitemap: ${sitemap.href}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
