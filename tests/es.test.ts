import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { WHATSAPP_E164, WHATSAPP_MESSAGE } from '../src/config/whatsapp';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);

const ES_TITLE = 'MPTour — paseos en Foz do Iguaçu';
const ES_DESCRIPTION =
  'En Foz, usted ve las Cataratas de los dos lados, escucha el agua, pasa por Itaipú y cruza a Paraguay.';

/** Visible label must stay a prefix of the accessible tour name. */
const ES_MAP = [
  { image: 'falls-br', label: 'Cataratas', name: 'Cataratas del lado brasileño' },
  { image: 'falls-ar', label: 'Cataratas', name: 'Cataratas lado argentino' },
  { image: 'itaipu', label: 'Itaipú', name: 'Itaipú' },
  { image: 'paraguay', label: 'Paraguay', name: 'Paraguay (Ciudad del Este)' },
  { image: 'frontier', label: 'Hito', name: 'Hito de las Tres Fronteras' },
] as const;

function readPage(outDir: string, page: string) {
  return parse(readFileSync(path.join(rootDir, outDir, page), 'utf8'));
}

function alternates(outDir: string, page: string) {
  return readPage(outDir, page)
    .querySelectorAll('link[rel="alternate"]')
    .map((link) => ({
      hreflang: link.getAttribute('hreflang'),
      href: link.getAttribute('href'),
    }));
}

function expectedAlternates(prefix: '' | '/mptour') {
  const home = `https://mptour.github.io${prefix}/`;
  return [
    { hreflang: 'pt-BR', href: home },
    { hreflang: 'es', href: `${home}es/` },
    { hreflang: 'en', href: `${home}en/` },
    { hreflang: 'x-default', href: home },
  ];
}

function sitemapXml(outDir: string) {
  const dir = path.join(rootDir, outDir);
  return readdirSync(dir)
    .filter((name) => name.startsWith('sitemap') && name.endsWith('.xml'))
    .map((name) => readFileSync(path.join(dir, name), 'utf8'))
    .join('\n');
}

describe('spanish locale', () => {
  it('publishes /es/ in Spanish, without the preparation notice or noindex', () => {
    const page = readPage('dist', 'es/index.html');
    const html = page.toString();

    expect(page.querySelector('html')?.getAttribute('lang')).toBe('es');
    expect(page.querySelector('#main')?.getAttribute('lang')).toBeUndefined();
    expect(page.querySelector('[data-testid="fallback-notice"]')).toBeNull();
    expect(page.querySelector('meta[name="robots"]')).toBeNull();
    expect(html).not.toContain('Versión en español en preparación');
    expect(html).not.toContain('Chame no WhatsApp');

    expect(page.querySelector('title')?.text.trim()).toBe(ES_TITLE);
    expect(page.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      ES_DESCRIPTION,
    );
    expect(page.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(ES_TITLE);
    expect(page.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe(
      ES_DESCRIPTION,
    );
    expect(page.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://mptour.github.io/es/',
    );

    expect(html).toContain('Escríbanos por WhatsApp');
    expect(html).toContain('Guía que vive en Foz');
    expect(html).toContain('Paseo privado');
    expect(html).toContain('Medio día, día entero, varios días o a medida.');
    expect(page.querySelector('[data-testid="footer"]')?.text).toContain(
      'Las fotos y los videos todavía son provisorios. El número de arriba es nuestro WhatsApp.',
    );
    expect(page.querySelector('[data-testid="credits-link"]')?.text.trim()).toBe(
      'Créditos de las fotos y los videos',
    );
    expect(page.querySelector('script[type="application/ld+json"]')).toBeTruthy();

    expect(page.querySelector('[data-testid="locale-es"]')?.hasAttribute('data-draft')).toBe(false);
    expect(page.querySelector('[data-testid="locale-en"]')?.hasAttribute('data-draft')).toBe(false);
    expect(
      readPage('dist', 'index.html')
        .querySelector('[data-testid="locale-es"]')
        ?.hasAttribute('data-draft'),
    ).toBe(false);
  });

  it('keeps the Spanish WhatsApp text on the official number', () => {
    expect(WHATSAPP_MESSAGE.es).toBe('Hola, MPTour. Quiero armar mi itinerario en Foz do Iguaçu.');

    const page = readPage('dist', 'es/index.html');
    const links = page.querySelectorAll('a[href*="wa.me"]');
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      const url = new URL(link.getAttribute('href') ?? '');
      expect(url.origin + url.pathname).toBe(`https://wa.me/${WHATSAPP_E164}`);
      expect(url.searchParams.get('text')).toBe(WHATSAPP_MESSAGE.es);
    }
  });

  it('translates the map labels and keeps each label a prefix of the tour name', () => {
    const page = readPage('dist', 'es/index.html');
    const pins = page.querySelectorAll('[data-testid="map-pin"]');
    expect(pins).toHaveLength(ES_MAP.length);

    for (const tour of ES_MAP) {
      expect(tour.name.startsWith(tour.label), tour.name).toBe(true);
      const pin = pins.find((node) => node.getAttribute('data-pin') === tour.image);
      expect(pin?.querySelector('.map-label')?.text.trim(), tour.image).toBe(tour.label);
      expect(pin?.text.replace(/\s+/g, ' ').trim(), tour.image).toContain(tour.name);
      expect(pin?.getAttribute('aria-label') ?? '', tour.image).toBe('');
      const card = page.querySelector(`[data-testid="map-card"][data-card="${tour.image}"]`);
      expect(card?.text, tour.image).toContain(tour.name);
    }

    expect(page.querySelector('.map-country[data-land="br"]')?.text.trim()).toBe('Brasil');
    expect(page.querySelector('.map-country[data-land="ar"]')?.text.trim()).toBe('Argentina');
    expect(page.querySelector('.map-country[data-land="py"]')?.text.trim()).toBe('Paraguay');
  });

  it('emits pt-BR, es, en and x-default only on the three homes', () => {
    for (const page of ['index.html', 'es/index.html', 'en/index.html']) {
      expect(alternates('dist', page), page).toEqual(expectedAlternates(''));
      expect(alternates('dist-base', page), `base ${page}`).toEqual(expectedAlternates('/mptour'));
    }
  });

  it('lists only the Portuguese credits page until Spanish and English credits exist', () => {
    expect(alternates('dist', 'creditos/index.html')).toEqual([
      { hreflang: 'pt-BR', href: 'https://mptour.github.io/creditos/' },
    ]);
    expect(alternates('dist-base', 'creditos/index.html')).toEqual([
      { hreflang: 'pt-BR', href: 'https://mptour.github.io/mptour/creditos/' },
    ]);
  });

  it('gives the missing page its own canonical and no hreflang', () => {
    for (const [outDir, href] of [
      ['dist', 'https://mptour.github.io/404/'],
      ['dist-base', 'https://mptour.github.io/mptour/404/'],
    ] as const) {
      const page = readPage(outDir, '404.html');
      expect(alternates(outDir, '404.html'), outDir).toEqual([]);
      expect(page.querySelector('link[rel="canonical"]')?.getAttribute('href'), outDir).toBe(href);
    }
  });

  it('adds /es/ and /en/ to the sitemap', () => {
    const rooted = sitemapXml('dist');
    expect(rooted).toContain('https://mptour.github.io/</loc>');
    expect(rooted).toContain('https://mptour.github.io/es/</loc>');
    expect(rooted).toContain('https://mptour.github.io/en/</loc>');

    const based = sitemapXml('dist-base');
    expect(based).toContain('https://mptour.github.io/mptour/</loc>');
    expect(based).toContain('https://mptour.github.io/mptour/es/</loc>');
    expect(based).toContain('https://mptour.github.io/mptour/en/</loc>');
  });
});
