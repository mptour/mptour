import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';
import { describe, expect, it } from 'vitest';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);

/** Acceptance: the home shows these five tours on an inline map, each with a card that links to its territory anchor. */
const TOURS = [
  {
    image: 'falls-br',
    name: 'Cataratas lado brasileiro',
    anchor: 'cataratas-brasil',
    card: 'mapa-cataratas-brasil',
  },
  {
    image: 'falls-ar',
    name: 'Cataratas lado argentino',
    anchor: 'cataratas-argentina',
    card: 'mapa-cataratas-argentina',
  },
  { image: 'itaipu', name: 'Itaipu', anchor: 'itaipu', card: 'mapa-itaipu' },
  {
    image: 'paraguay',
    name: 'Paraguai (Ciudad del Este)',
    anchor: 'paraguai',
    card: 'mapa-paraguai',
  },
  {
    image: 'frontier',
    name: 'Marco das Três Fronteiras',
    anchor: 'tres-fronteiras',
    card: 'mapa-tres-fronteiras',
  },
] as const;

function readPage(outDir: string, page: string) {
  const file = path.join(rootDir, outDir, page);
  expect(existsSync(file), `${outDir}/${page} should exist`).toBe(true);
  return parse(readFileSync(file, 'utf8'));
}

function expectMap(outDir: string, page: string, homePath: string) {
  const html = readPage(outDir, page);
  const source = html.toString();
  const territories = html.querySelector('[data-testid="territories"]');
  const map = territories?.querySelector('[data-testid="region-map"]');
  expect(map, `${outDir}/${page} should render the region map inside territories`).toBeTruthy();

  const order = territories?.querySelectorAll(
    '[data-testid="region-map"], [data-testid="territory"]',
  );
  expect(order?.[0]?.getAttribute('data-testid')).toBe('region-map');

  const svg = map?.querySelector('svg');
  expect(svg?.getAttribute('aria-hidden')).toBe('true');
  expect(svg?.getAttribute('focusable')).toBe('false');
  expect(svg?.querySelector('a, text, title, image, [tabindex]')).toBeNull();
  expect(svg?.toString().length ?? Infinity).toBeLessThan(6000);
  expect(source).not.toMatch(/leaflet|mapbox|maplibre|openstreetmap|tiles\.|apiKey|api_key/i);

  const pins = map?.querySelectorAll('[data-testid="map-pin"]') ?? [];
  const cards = map?.querySelectorAll('[data-testid="map-card"]') ?? [];
  expect(pins).toHaveLength(TOURS.length);
  expect(cards).toHaveLength(TOURS.length);
  expect(
    map?.querySelector('[aria-current]'),
    'selection is applied by script, not SSR',
  ).toBeNull();
  expect(map?.querySelector('.is-open')).toBeNull();
  expect(map?.text).not.toMatch(/PLACEHOLDER/);

  for (const tour of TOURS) {
    const pin = pins.find((node) => node.getAttribute('data-pin') === tour.image);
    expect(pin, tour.name).toBeTruthy();
    expect(pin?.tagName.toLowerCase()).toBe('a');
    expect(pin?.getAttribute('aria-label'), 'visible label must be the accessible name').toBeNull();
    expect(pin?.getAttribute('href')).toBe(`#${tour.card}`);
    expect(pin?.text).toContain(tour.name);

    const card = cards.find((node) => node.getAttribute('data-card') === tour.image);
    expect(card?.getAttribute('id')).toBe(tour.card);
    expect(card?.getAttribute('tabindex')).toBe('-1');
    expect(card?.text).toContain(tour.name);
    expect(card?.text).not.toMatch(/PLACEHOLDER/);

    const link = card?.querySelector('a');
    expect(link?.getAttribute('href')).toBe(`${homePath}#${tour.anchor}`);
    const tile = html.querySelector(`[data-testid="territory"]#${tour.anchor}`);
    expect(tile, `${tour.anchor} should be a real territory anchor`).toBeTruthy();
  }

  return map as HTMLElement;
}

describe('region map', () => {
  it('places an inline map of the five tours on the home, with a card link to each territory', () => {
    expectMap('dist', 'index.html', '/');
  });

  it('keeps the same map on the locale fallbacks and under the project-site base', () => {
    expectMap('dist', 'es/index.html', '/es/');
    expectMap('dist', 'en/index.html', '/en/');
    expectMap('dist-base', 'index.html', '/mptour/');
    expectMap('dist-base', 'es/index.html', '/mptour/es/');
  });
});
