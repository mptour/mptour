import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';
import { describe, expect, it } from 'vitest';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);

/**
 * Lighthouse mobile emulates a 412 CSS-px viewport at DPR 1.75.
 * With sizes="100vw" the hero slot is 721 device px, so the chosen
 * candidate is the smallest srcset width at or above that.
 */
const MOBILE_VIEWPORT_CSS_PX = 412;
const MOBILE_DPR = 1.75;
const MOBILE_HERO_BUDGET_BYTES = 100_000;
const MOBILE_CANDIDATE_MAX_WIDTH = 828;

interface Candidate {
  url: string;
  width: number;
}

function parseSrcset(srcset: string): Candidate[] {
  return srcset
    .split(',')
    .map((part) => {
      const [url, descriptor] = part.trim().split(/\s+/);
      return { url: url ?? '', width: Number.parseInt(descriptor ?? '', 10) };
    })
    .filter((candidate) => candidate.url.length > 0 && Number.isFinite(candidate.width));
}

function selectMobileCandidate(srcset: string): Candidate {
  const target = MOBILE_VIEWPORT_CSS_PX * MOBILE_DPR;
  const candidates = parseSrcset(srcset).sort((a, b) => a.width - b.width);
  const selected = candidates.find((candidate) => candidate.width >= target) ?? candidates.at(-1);
  expect(selected, 'hero AVIF srcset should list at least one candidate').toBeTruthy();
  return selected as Candidate;
}

function readHtml(outDir: string, page: string) {
  return parse(readFileSync(path.join(rootDir, outDir, page), 'utf8'));
}

function assetFile(outDir: string, url: string) {
  const prefix = outDir === 'dist-base' ? '/mptour' : '';
  expect(url.startsWith(`${prefix}/`), url).toBe(true);
  return path.join(rootDir, outDir, url.slice(prefix.length).replace(/^\//, ''));
}

function heroPicture(page: HTMLElement) {
  const hero = page.querySelector('[data-testid="hero"]');
  expect(hero).toBeTruthy();
  const avif = hero?.querySelector('source[type="image/avif"]');
  const webp = hero?.querySelector('source[type="image/webp"]');
  const img = hero?.querySelector('img');
  return { avif, webp, img };
}

describe('mobile hero budget', () => {
  for (const outDir of ['dist', 'dist-base'] as const) {
    it(`keeps the Lighthouse-mobile hero AVIF under ${MOBILE_HERO_BUDGET_BYTES} bytes (${outDir})`, () => {
      const page = readHtml(outDir, 'index.html');
      const { avif, webp, img } = heroPicture(page);
      const avifSrcset = avif?.getAttribute('srcset') ?? '';
      const webpSrcset = webp?.getAttribute('srcset') ?? '';
      expect(avifSrcset, 'hero needs an AVIF srcset').not.toBe('');
      expect(webpSrcset, 'hero needs a WebP srcset').not.toBe('');

      const selected = selectMobileCandidate(avifSrcset);
      expect(selected.width).toBeLessThanOrEqual(MOBILE_CANDIDATE_MAX_WIDTH);

      const webpWidths = parseSrcset(webpSrcset)
        .map((candidate) => candidate.width)
        .sort((a, b) => a - b);
      const avifWidths = parseSrcset(avifSrcset)
        .map((candidate) => candidate.width)
        .sort((a, b) => a - b);
      expect(webpWidths).toEqual(avifWidths);

      const bytes = statSync(assetFile(outDir, selected.url)).size;
      expect(bytes).toBeLessThanOrEqual(MOBILE_HERO_BUDGET_BYTES);

      expect(img?.getAttribute('loading')).not.toBe('lazy');
      expect(img?.getAttribute('fetchpriority')).toBe('high');
      expect(avif?.getAttribute('sizes')).toBe('100vw');
    });

    it(`preloads the hero AVIF with the same srcset (${outDir})`, () => {
      for (const pagePath of ['index.html', 'es/index.html', 'en/index.html']) {
        const page = readHtml(outDir, pagePath);
        const { avif } = heroPicture(page);
        const avifSrcset = avif?.getAttribute('srcset') ?? '';
        const preload = page
          .querySelectorAll('link[rel="preload"]')
          .find((link) => link.getAttribute('as') === 'image');
        expect(preload, pagePath).toBeTruthy();
        expect(preload?.getAttribute('type')).toBe('image/avif');
        expect(preload?.getAttribute('imagesrcset')).toBe(avifSrcset);
        expect(preload?.getAttribute('imagesizes')).toBe(avif?.getAttribute('sizes'));
        expect(preload?.getAttribute('fetchpriority')).toBe('high');
        expect(preload?.getAttribute('href')).toBe(selectMobileCandidate(avifSrcset).url);
      }

      for (const pagePath of ['404.html', 'creditos/index.html']) {
        const page = readHtml(outDir, pagePath);
        const imagePreload = page
          .querySelectorAll('link[rel="preload"]')
          .find((link) => link.getAttribute('as') === 'image');
        expect(imagePreload, pagePath).toBeUndefined();
      }
    });
  }
});
