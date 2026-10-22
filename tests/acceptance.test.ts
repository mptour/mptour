import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { WHATSAPP_DISPLAY, WHATSAPP_E164, WHATSAPP_MESSAGE } from '../src/config/whatsapp';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);

function readPage(outDir: string, page: string) {
  const file = path.join(rootDir, outDir, page);
  expect(existsSync(file), `${outDir}/${page} should exist`).toBe(true);
  return parse(readFileSync(file, 'utf8'));
}

function rootRelativeUrls(html: string) {
  const urls: string[] = [];
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) urls.push(match[1] ?? '');
  for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const part of (match[1] ?? '').split(',')) {
      const url = part.trim().split(/\s+/)[0];
      if (url) urls.push(url);
    }
  }
  return urls.filter((url) => url.startsWith('/') && !url.startsWith('//'));
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return [full];
  });
}

describe('placeholders, i18n and base path', () => {
  it('keeps visitor copy free of the PLACEHOLDER marker and lists the experiences without prices', () => {
    const page = readPage('dist', 'index.html');
    const html = page.toString();

    expect(page.querySelector('[data-testid="placeholder-ribbon"]')).toBeNull();
    expect(page.querySelector('title')?.text).not.toMatch(/PLACEHOLDER/);
    expect(page.querySelector('meta[name="description"]')?.getAttribute('content')).not.toMatch(
      /PLACEHOLDER/,
    );
    expect(
      page.querySelector('meta[property="og:description"]')?.getAttribute('content'),
    ).not.toMatch(/PLACEHOLDER/);
    const ogAlt =
      page.querySelector('meta[property="og:image:alt"]')?.getAttribute('content') ?? '';
    expect(ogAlt).not.toMatch(/PLACEHOLDER/);
    expect(ogAlt.length).toBeGreaterThan(10);
    expect(page.querySelector('[data-testid="footer"]')?.text).not.toMatch(/PLACEHOLDER/);
    for (const node of page.querySelectorAll(
      '[data-testid="experience"], [data-testid="territory"]',
    )) {
      expect(node.text).not.toMatch(/PLACEHOLDER/);
    }
    expect(page.querySelectorAll('.nav-link').map((node) => node.getAttribute('href'))).toEqual([
      '/#territorios',
      '/#experiencias',
      '/#como-funciona',
    ]);
    expect(page.querySelector('.header-cta')?.getAttribute('href')).toBe('/#monte-seu-roteiro');
    expect(page.querySelector('[data-testid="credits-link"]')?.getAttribute('href')).toBe(
      '/creditos/',
    );
    expect(page.querySelector('meta[property="og:title"]')).toBeTruthy();
    expect(page.querySelector('meta[property="og:image"]')).toBeTruthy();
    expect(page.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://mptour.github.io/',
    );

    const images = page.querySelectorAll('img');
    expect(images.length).toBeGreaterThan(0);
    for (const image of images) {
      expect(image.getAttribute('data-placeholder')).toBe('image');
      const alt = image.getAttribute('alt') ?? '';
      expect(alt).not.toMatch(/PLACEHOLDER/);
      expect(alt.trim().length).toBeGreaterThan(8);
    }

    expect(page.querySelectorAll('[data-testid="territory"]')).toHaveLength(5);
    expect(page.querySelectorAll('[data-testid="experience"]')).toHaveLength(5);
    expect(html).not.toMatch(/R\$|US\$|€|\bpreço\b/i);

    const testids = page
      .querySelectorAll('[data-testid]')
      .map((node) => node.getAttribute('data-testid'));
    const sections = [
      'hero',
      'manifesto',
      'territories',
      'experiences',
      'method',
      'plan',
      'footer',
    ].map((id) => testids.indexOf(id));
    expect(sections.every((index) => index >= 0)).toBe(true);
    expect([...sections].sort((a, b) => a - b)).toEqual(sections);

    expect(html).toContain(WHATSAPP_DISPLAY);
    expect(html).not.toContain('data-placeholder="whatsapp"');
  });

  it('names photos and videos on the credits link, matching the credits page title', () => {
    const expected = 'Créditos das fotos e dos vídeos';
    const ptLink = readPage('dist', 'index.html').querySelector('[data-testid="credits-link"]');
    expect(ptLink?.getAttribute('href')).toMatch(/\/creditos\/$/);
    expect(ptLink?.text.trim()).toBe(expected);

    const esLink = readPage('dist', 'es/index.html').querySelector('[data-testid="credits-link"]');
    expect(esLink?.getAttribute('href')).toMatch(/\/creditos\/$/);
    expect(esLink?.text.trim()).toBe('Créditos de las fotos y los videos');

    const enLink = readPage('dist', 'en/index.html').querySelector('[data-testid="credits-link"]');
    expect(enLink?.getAttribute('href')).toMatch(/\/creditos\/$/);
    expect(enLink?.text.trim()).toBe('Photo and video credits');

    const credits = readPage('dist', 'creditos/index.html');
    expect(credits.querySelector('title')?.text.trim()).toBe(expected);
    expect(credits.querySelector('h1')?.text.trim()).toBe(expected);
    expect(credits.querySelector('.lede')?.text.trim()).toBe(
      'As fotos e os vídeos ainda são provisórios. Aqui embaixo tem a fonte, o autor e a licença de cada um.',
    );
  });

  it('says photos and videos are still provisional in the footer sentence', () => {
    const expected =
      'As fotos e os vídeos ainda são provisórios. O número acima é o nosso WhatsApp.';
    for (const page of ['index.html', 'creditos/index.html']) {
      const footer = readPage('dist', page).querySelector('[data-testid="footer"]');
      expect(footer?.text, page).toContain(expected);
    }
    expect(
      readPage('dist', 'es/index.html').querySelector('[data-testid="footer"]')?.text,
    ).toContain(
      'Las fotos y los videos todavía son provisorios. El número de arriba es nuestro WhatsApp.',
    );
    expect(
      readPage('dist', 'en/index.html').querySelector('[data-testid="footer"]')?.text,
    ).toContain('The photos and videos are still temporary. The number above is our WhatsApp.');
  });

  it('publishes Spanish and English as real locales, with their own WhatsApp text', () => {
    for (const locale of ['es', 'en'] as const) {
      const page = readPage('dist', `${locale}/index.html`);
      expect(page.querySelector('html')?.getAttribute('lang'), locale).toBe(locale);
      expect(page.querySelector('#main')?.getAttribute('lang'), locale).toBeUndefined();
      expect(page.querySelector('[data-testid="fallback-notice"]'), locale).toBeNull();
      expect(page.querySelector('meta[name="robots"]'), locale).toBeNull();
      const href = page.querySelector('[data-testid="cta-whatsapp"]')?.getAttribute('href') ?? '';
      expect(new URL(href).searchParams.get('text'), locale).toBe(WHATSAPP_MESSAGE[locale]);
      expect(
        page.querySelectorAll('.nav-link').map((node) => node.getAttribute('href')),
        locale,
      ).toEqual([
        `/${locale}/#territorios`,
        `/${locale}/#experiencias`,
        `/${locale}/#como-funciona`,
      ]);
    }

    expect(
      readPage('dist', 'es/index.html').querySelector('[data-testid="cta-whatsapp"] .sr-only')
        ?.text,
    ).toBe(' WhatsApp, se abre en una pestaña nueva');
    expect(
      readPage('dist', 'en/index.html').querySelector('[data-testid="cta-whatsapp"] .sr-only')
        ?.text,
    ).toBe(' WhatsApp, opens in a new tab');

    const home = readPage('dist', 'index.html');
    const langs = home
      .querySelectorAll('link[rel="alternate"]')
      .map((link) => link.getAttribute('hreflang'));
    expect(langs).toEqual(['pt-BR', 'es', 'en', 'x-default']);
    expect(home.querySelector('[data-testid="fallback-notice"]')).toBeNull();
    expect(home.querySelector('[data-testid="locale-pt"]')?.getAttribute('aria-current')).toBe(
      'page',
    );
  });

  it('prefixes internal URLs with /mptour and leaves the root build at /', () => {
    const rooted = readFileSync(path.join(rootDir, 'dist/index.html'), 'utf8');
    const based = readFileSync(path.join(rootDir, 'dist-base/index.html'), 'utf8');

    expect(rootRelativeUrls(rooted).some((url) => url.startsWith('/mptour/'))).toBe(false);
    const basedUrls = rootRelativeUrls(based);
    expect(basedUrls.length).toBeGreaterThan(0);
    for (const url of basedUrls) expect(url.startsWith('/mptour/')).toBe(true);

    const basedPage = parse(based);
    expect(basedPage.querySelector('[data-testid="cta-primary"]')?.getAttribute('href')).toBe(
      '#monte-seu-roteiro',
    );
    expect(basedPage.querySelector('.nav-link')?.getAttribute('href')).toBe('/mptour/#territorios');
    expect(basedPage.querySelector('[data-testid="credits-link"]')?.getAttribute('href')).toBe(
      '/mptour/creditos/',
    );
    const basedEs = readPage('dist-base', 'es/index.html');
    expect(basedEs.querySelector('.nav-link')?.getAttribute('href')).toBe(
      '/mptour/es/#territorios',
    );
    expect(basedPage.querySelector('[data-testid="locale-es"]')?.getAttribute('href')).toBe(
      '/mptour/es/',
    );
    expect(
      basedPage.querySelector('[data-testid="cta-whatsapp"]')?.getAttribute('href') ?? '',
    ).toContain('https://wa.me/554599272309');
  });

  it('keeps the official number in a single source file', () => {
    const allowed = new Set([
      'src/config/whatsapp.ts',
      'tests/whatsapp.test.ts',
      'tests/acceptance.test.ts',
      'tests/home.test.ts',
      'README.md',
    ]);
    const offenders: string[] = [];
    for (const file of walk(rootDir)) {
      if (/\.(png|jpe?g|webp|avif|woff2?|mp4|gif|ico)$/i.test(file)) continue;
      const relative = path.relative(rootDir, file);
      if (
        relative.startsWith('node_modules') ||
        relative.startsWith('dist') ||
        relative.startsWith('.git') ||
        relative.startsWith('.astro')
      ) {
        continue;
      }
      const source = readFileSync(file, 'utf8');
      if (source.includes(WHATSAPP_E164) && !allowed.has(relative)) offenders.push(relative);
    }
    expect(offenders).toEqual([]);
  });

  it('never canonicalizes the missing page and keeps internal routes real', () => {
    const missing = readPage('dist', '404.html');
    expect(missing.toString()).not.toMatch(/PLACEHOLDER/);
    const canonical = missing.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '';
    expect(canonical).toBe('https://mptour.github.io/');
    expect(canonical).not.toContain('404');

    const basedMissing = readPage('dist-base', '404.html');
    const basedCanonical =
      basedMissing.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '';
    expect(basedCanonical).toBe('https://mptour.github.io/mptour/');
    expect(basedCanonical).not.toContain('404');

    const home = readFileSync(path.join(rootDir, 'dist/index.html'), 'utf8');
    const known = new Set(['/', '/es/', '/en/', '/creditos/']);
    const hrefs = [...home.matchAll(/href="([^"]*)"/g)].map((match) => match[1] ?? '');
    for (const href of hrefs) {
      if (!href.startsWith('/') || href.startsWith('//')) continue;
      const pathOnly = href.split('#')[0] ?? '';
      if (/\.[a-z0-9]+$/i.test(pathOnly)) continue;
      expect(pathOnly.endsWith('/'), href).toBe(true);
      expect(known.has(pathOnly), href).toBe(true);
    }
  });

  it('ships reduced-motion CSS', () => {
    const css = walk(path.join(rootDir, 'dist'))
      .filter((file) => file.endsWith('.css'))
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
  });
});
