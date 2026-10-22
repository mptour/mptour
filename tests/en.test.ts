import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { WHATSAPP_E164, WHATSAPP_MESSAGE } from '../src/config/whatsapp';
import { en } from '../src/i18n';
import { isCopy } from '../src/i18n/mark';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);

const TITLE = 'MPTour — tours in Foz do Iguaçu';
const DESCRIPTION =
  'In Foz, you see the Falls from both sides, hear the water, stop at Itaipu, and cross into Paraguay.';
const WHATSAPP_EN = 'Hi, MPTour. I want a private tour in Foz do Iguaçu.';

const MAP_POINTS = [
  { image: 'falls-br', name: 'Falls on the Brazilian side', label: 'Falls' },
  { image: 'falls-ar', name: 'Falls on the Argentine side', label: 'Falls' },
  { image: 'itaipu', name: 'Itaipu', label: 'Itaipu' },
  { image: 'paraguay', name: 'Paraguay (Ciudad del Este)', label: 'Paraguay' },
  { image: 'frontier', name: 'Mark of the Three Borders', label: 'Mark' },
] as const;

function readPage(outDir: string, page: string) {
  const file = path.join(rootDir, outDir, page);
  expect(existsSync(file), `${outDir}/${page} should exist`).toBe(true);
  return parse(readFileSync(file, 'utf8'));
}

function alternates(outDir: string, page: string) {
  const links = readPage(outDir, page).querySelectorAll('link[rel="alternate"]');
  return Object.fromEntries(
    links.map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')]),
  );
}

describe('English locale', () => {
  it('publishes /en/ in English, without the translation notice or noindex', () => {
    for (const [outDir, home, enHref] of [
      ['dist', 'https://mptour.github.io/', 'https://mptour.github.io/en/'],
      ['dist-base', 'https://mptour.github.io/mptour/', 'https://mptour.github.io/mptour/en/'],
    ] as const) {
      const esHref = new URL('es/', home).href;
      const page = readPage(outDir, 'en/index.html');
      const html = page.toString();

      expect(page.querySelector('html')?.getAttribute('lang'), outDir).toBe('en');
      expect(page.querySelector('#main')?.getAttribute('lang'), outDir).toBeUndefined();
      expect(page.querySelector('[data-testid="fallback-notice"]'), outDir).toBeNull();
      expect(page.querySelector('meta[name="robots"]'), outDir).toBeNull();
      expect(html, outDir).not.toMatch(/English version in preparation|Em preparação/);

      expect(page.querySelector('title')?.text.trim(), outDir).toBe(TITLE);
      expect(page.querySelector('meta[name="description"]')?.getAttribute('content'), outDir).toBe(
        DESCRIPTION,
      );
      expect(page.querySelector('meta[property="og:title"]')?.getAttribute('content'), outDir).toBe(
        TITLE,
      );
      expect(
        page.querySelector('meta[property="og:description"]')?.getAttribute('content'),
        outDir,
      ).toBe(DESCRIPTION);
      expect(page.querySelector('h1')?.text, outDir).toContain('You hear the water');
      expect(page.querySelector('h1')?.text, outDir).not.toMatch(/Você ouve/);
      expect(page.querySelector('[data-testid="cta-primary"]')?.text.trim(), outDir).toBe(
        'Message us on WhatsApp',
      );
      expect(page.querySelector('[data-testid="cta-whatsapp"]')?.text, outDir).toContain(
        'Message us on WhatsApp',
      );
      expect(page.querySelector('[data-testid="manifesto"]')?.text, outDir).toContain(
        'A guide who lives in Foz',
      );
      expect(page.querySelector('[data-testid="experiences"]')?.text, outDir).toContain(
        'Half a day, a full day, several days, or custom.',
      );

      const href = page.querySelector('[data-testid="cta-whatsapp"]')?.getAttribute('href') ?? '';
      const url = new URL(href);
      expect(url.origin + url.pathname, outDir).toBe(`https://wa.me/${WHATSAPP_E164}`);
      expect(url.searchParams.get('text'), outDir).toBe(WHATSAPP_EN);
      expect(WHATSAPP_MESSAGE.en).toBe(WHATSAPP_EN);

      const map = page.querySelector('[data-testid="region-map"]');
      for (const point of MAP_POINTS) {
        const pin = map?.querySelector(`[data-testid="map-pin"][data-pin="${point.image}"]`);
        expect(pin?.getAttribute('aria-label'), point.name).toBeFalsy();
        expect(pin?.querySelector('.map-label')?.text.trim(), point.name).toBe(point.label);
        expect(pin?.text, point.name).toContain(point.name);
        expect(point.name.startsWith(point.label), point.name).toBe(true);
      }

      expect(page.querySelector('[data-testid="footer"]')?.text, outDir).toContain(
        'The photos and videos are still temporary. The number above is our WhatsApp.',
      );
      expect(page.querySelector('[data-testid="credits-link"]')?.text.trim(), outDir).toBe(
        'Photo and video credits',
      );
      expect(page.querySelector('[data-testid="locale-en"]')?.text, outDir).not.toMatch(
        /preparation|preparação/i,
      );
      expect(page.querySelector('[data-testid="locale-es"]')?.text, outDir).not.toMatch(
        /preparation|preparação/i,
      );
      expect(
        page.querySelector('[data-testid="locale-en"]')?.hasAttribute('data-draft'),
        outDir,
      ).toBe(false);
      expect(
        page.querySelector('[data-testid="locale-es"]')?.hasAttribute('data-draft'),
        outDir,
      ).toBe(false);

      const expected = {
        'pt-BR': home,
        es: esHref,
        en: enHref,
        'x-default': home,
      };
      expect(alternates(outDir, 'en/index.html'), outDir).toEqual(expected);
      expect(alternates(outDir, 'index.html'), outDir).toEqual(expected);

      const sitemap = readFileSync(path.join(rootDir, outDir, 'sitemap-0.xml'), 'utf8');
      expect(sitemap, outDir).toContain(`<loc>${home}</loc>`);
      expect(sitemap, outDir).toContain(`<loc>${enHref}</loc>`);
      expect(sitemap, outDir).toContain(`<loc>${esHref}</loc>`);
    }

    const spanish = readPage('dist', 'es/index.html');
    expect(spanish.querySelector('html')?.getAttribute('lang')).toBe('es');
    expect(spanish.querySelector('#main')?.getAttribute('lang')).toBeUndefined();
    expect(spanish.querySelector('[data-testid="fallback-notice"]')).toBeNull();
    expect(spanish.querySelector('meta[name="robots"]')).toBeNull();
    expect(WHATSAPP_MESSAGE.pt).toBe('Olá, MPTour. Quero montar meu roteiro em Foz do Iguaçu.');
    expect(WHATSAPP_MESSAGE.es).toBe('Hola, MPTour. Quiero armar mi itinerario en Foz do Iguaçu.');
  });

  it('keeps the guide voice, the flexible durations, and the map label rule', () => {
    const lines: string[] = [];
    const walk = (value: unknown) => {
      if (isCopy(value)) lines.push(value.text);
      else if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === 'object') Object.values(value).forEach(walk);
    };
    walk(en);
    const copy = lines.join('\n');

    expect(en.meta.title.text).toBe(TITLE);
    expect(en.meta.description.text).toBe(DESCRIPTION);
    expect(en.hero.cta.text).toBe('Message us on WhatsApp');
    expect(en.plan.cta.text).toBe('Message us on WhatsApp');
    expect(en.manifesto.facts.map((fact) => fact.text)).toEqual([
      'Private tour',
      'A guide who lives in Foz',
      'Brazil, Argentina, Paraguay',
    ]);
    expect(en.experiences.lede.text).toContain('Half a day, a full day, several days, or custom.');
    expect(en.experiences.items.map((item) => item.duration.text)).toEqual([
      'However you want',
      'However you want',
      'However you want',
      'However you want',
      'However you want',
    ]);
    expect(en.experiences.items.map((item) => item.title.text).join('\n')).not.toMatch(
      /half a day|full day|several days/i,
    );
    expect(en.regionMap.points.map((point) => [point.label.text, point.name.text])).toEqual(
      MAP_POINTS.map((point) => [point.label, point.name]),
    );
    for (const point of en.regionMap.points) {
      expect(point.name.text.startsWith(point.label.text), point.name.text).toBe(true);
    }
    expect(copy).not.toMatch(
      /\bdiscover\b|unforgettable|unique experience|\bcurated\b|hidden gem|\bjourney\b|tailor-made|world-class|\bnestled\b|breathtaking|\bimmerse\b|\bembark\b|private experience|PLACEHOLDER/i,
    );
  });
});
