import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { IMAGE_CREDITS } from '../src/assets/credits';
import { HERO_NARROW_MEDIA, shouldLoadHeroVideo } from '../src/scripts/site';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const STOCK_HOST = /^https:\/\/(?:www\.)?(?:pexels\.com|pixabay\.com|mixkit\.co)\//;

const PLACES = [
  { name: 'Cataratas', pattern: /catarata|iguaçu|iguazu/i },
  { name: 'Itaipu', pattern: /itaipu/i },
  {
    name: 'Marco das Três Fronteiras',
    pattern: /tr[eê]s fronteiras|tres fronteiras|triple frontier/i,
  },
];

interface Probe {
  width: number;
  height: number;
  duration: number;
  hasAudio: boolean;
  codec: string;
}

function probe(file: string): Probe {
  const raw = execFileSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-show_entries',
      'stream=codec_type,codec_name,width,height',
      '-show_entries',
      'format=duration',
      '-of',
      'json',
      file,
    ],
    { encoding: 'utf8' },
  );
  const parsed = JSON.parse(raw) as {
    streams?: { codec_type?: string; codec_name?: string; width?: number; height?: number }[];
    format?: { duration?: string };
  };
  const video = parsed.streams?.find((stream) => stream.codec_type === 'video');
  return {
    width: video?.width ?? 0,
    height: video?.height ?? 0,
    duration: Number(parsed.format?.duration ?? 0),
    hasAudio: parsed.streams?.some((stream) => stream.codec_type === 'audio') ?? false,
    codec: video?.codec_name ?? '',
  };
}

describe('Foz hero montage', () => {
  it('credits each free-license clip on /creditos/ and keeps the photographs', () => {
    const page = parse(readFileSync(path.join(rootDir, 'dist/creditos/index.html'), 'utf8'));
    const items = page.querySelectorAll('.credits-page li').map((item) => ({
      text: item.text.replace(/\s+/g, ' ').trim(),
      href: item.querySelector('a')?.getAttribute('href') ?? '',
    }));

    for (const place of PLACES) {
      const hit = items.find((item) => place.pattern.test(item.text) && STOCK_HOST.test(item.href));
      expect(hit, `${place.name} should link to Pexels, Pixabay, or Mixkit`).toBeTruthy();
      expect(hit?.text.length ?? 0).toBeGreaterThan(place.name.length);
    }

    for (const photo of IMAGE_CREDITS) {
      expect(items.some((item) => item.href === photo.href)).toBe(true);
    }
  });

  it('ships the same muted montage as a light 16:9 file and a 9:16 phone crop', () => {
    const desktop = path.join(rootDir, 'dist/media/hero.mp4');
    const desktopWebm = path.join(rootDir, 'dist/media/hero.webm');
    const phone = path.join(rootDir, 'dist/media/hero-narrow.mp4');
    const phoneWebm = path.join(rootDir, 'dist/media/hero-narrow.webm');
    expect(existsSync(phone), 'hero-narrow.mp4').toBe(true);
    expect(existsSync(phoneWebm), 'hero-narrow.webm').toBe(true);

    const wide = probe(desktop);
    const wideWebm = probe(desktopWebm);
    const narrow = probe(phone);
    const narrowWebm = probe(phoneWebm);
    expect(wide).toMatchObject({ width: 1280, height: 720, hasAudio: false, codec: 'h264' });
    expect(wideWebm).toMatchObject({ width: 1280, height: 720, hasAudio: false, codec: 'vp9' });
    expect(narrow).toMatchObject({ width: 720, height: 1280, hasAudio: false, codec: 'h264' });
    expect(narrowWebm).toMatchObject({ width: 720, height: 1280, hasAudio: false, codec: 'vp9' });
    for (const clip of [wide, wideWebm, narrow, narrowWebm]) {
      expect(clip.duration).toBeGreaterThanOrEqual(12);
      expect(clip.duration).toBeLessThanOrEqual(18);
    }
    expect(Math.abs(wide.duration - narrow.duration)).toBeLessThan(0.4);
    expect(Math.abs(wide.duration - narrowWebm.duration)).toBeLessThan(0.4);

    expect(statSync(desktop).size).toBeLessThan(2 * 1024 * 1024);
    expect(statSync(desktopWebm).size).toBeLessThan(2 * 1024 * 1024);
    expect(statSync(phone).size).toBeLessThan(3 * 1024 * 1024);
    expect(statSync(phoneWebm).size).toBeLessThan(3 * 1024 * 1024);
    expect(statSync(phone).size).toBeGreaterThan(0);

    const page = parse(readFileSync(path.join(rootDir, 'dist/index.html'), 'utf8'));
    const video = page.querySelector('[data-testid="hero"] video[data-hero-video]');
    expect(video?.getAttribute('data-src-mp4-narrow')).toBe('/media/hero-narrow.mp4');
    expect(video?.getAttribute('data-src-webm-narrow')).toBe('/media/hero-narrow.webm');
    expect(page.querySelector('[data-hero-playback]')?.tagName).toBe('BUTTON');
  });

  it('loads on a phone and picks the vertical files there', async () => {
    expect(HERO_NARROW_MEDIA).toBe('(max-width: 839px)');
    expect(shouldLoadHeroVideo({ reduce: false, wide: false, saveData: false })).toBe(true);

    const site = await import('../src/scripts/site');
    expect(typeof site.pickHeroSources).toBe('function');
    const dataset = {
      srcWebm: '/media/hero.webm',
      srcMp4: '/media/hero.mp4',
      srcWebmNarrow: '/media/hero-narrow.webm',
      srcMp4Narrow: '/media/hero-narrow.mp4',
    };
    expect(site.pickHeroSources?.({ wide: false, dataset })).toEqual({
      webm: '/media/hero-narrow.webm',
      mp4: '/media/hero-narrow.mp4',
    });
    expect(site.pickHeroSources?.({ wide: true, dataset })).toEqual({
      webm: '/media/hero.webm',
      mp4: '/media/hero.mp4',
    });
    expect(
      site.pickHeroSources?.({
        wide: false,
        dataset: { src: '/clip.mp4' },
      }),
    ).toEqual({ single: '/clip.mp4' });
  });
});
