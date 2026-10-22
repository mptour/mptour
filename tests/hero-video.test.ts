import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const html = readFileSync(path.join(rootDir, 'dist/index.html'), 'utf8');
const root = parse(html);

/** Hard ceiling from the acceptance budget. Encodes should land well under this. */
const MAX_BYTES = 2 * 1024 * 1024;

describe('hero video', () => {
  it('layers a muted sourceless clip over the priority photograph', () => {
    const hero = root.querySelector('[data-testid="hero"]');
    const video = hero?.querySelector('video[data-hero-video]');
    expect(video).toBeTruthy();
    expect(video?.getAttribute('preload')).toBe('none');
    expect(video?.hasAttribute('muted')).toBe(true);
    expect(video?.hasAttribute('loop')).toBe(true);
    expect(video?.hasAttribute('playsinline')).toBe(true);
    expect(video?.hasAttribute('autoplay')).toBe(true);
    expect(video?.getAttribute('aria-hidden')).toBe('true');
    expect(video?.hasAttribute('src')).toBe(false);
    expect(video?.querySelector('source')).toBeNull();
    expect(video?.hasAttribute('poster')).toBe(false);

    const playback = hero?.querySelector('[data-hero-playback]');
    expect(playback?.tagName).toBe('BUTTON');
    expect(video?.querySelector('[data-hero-playback]')).toBeNull();
    expect(playback?.hasAttribute('hidden')).toBe(true);
    expect(playback?.text.trim()).toBe('Pausar vídeo');
    expect(playback?.getAttribute('aria-pressed')).toBe('false');

    const still = hero?.querySelector('img');
    expect(still?.getAttribute('fetchpriority')).toBe('high');
    expect(still?.getAttribute('loading')).toBe('eager');
    expect(still?.getAttribute('alt') ?? '').toMatch(/^PLACEHOLDER/);

    const mp4 = video?.getAttribute('data-src-mp4') ?? '';
    const webm = video?.getAttribute('data-src-webm') ?? '';
    expect(mp4).toBe('/media/hero.mp4');
    expect(webm).toBe('/media/hero.webm');

    for (const url of [mp4, webm]) {
      const file = path.join(rootDir, 'dist', url.slice(1));
      expect(existsSync(file), url).toBe(true);
      expect(statSync(file).size).toBeLessThan(MAX_BYTES);
      expect(statSync(file).size).toBeGreaterThan(0);
    }

    const mp4Bytes = readFileSync(path.join(rootDir, 'dist/media/hero.mp4'));
    expect(mp4Bytes.includes(Buffer.from('soun'))).toBe(false);
    expect(mp4Bytes.includes(Buffer.from('mp4a'))).toBe(false);

    const webmBytes = readFileSync(path.join(rootDir, 'dist/media/hero.webm'));
    expect(
      webmBytes.includes(Buffer.from('V_VP9')) || webmBytes.includes(Buffer.from('V_AV1')),
    ).toBe(true);
    expect(webmBytes.includes(Buffer.from('A_OPUS'))).toBe(false);
    expect(webmBytes.includes(Buffer.from('A_VORBIS'))).toBe(false);
  });

  it('prefixes the clip URLs when the site is served from /mptour', () => {
    const based = parse(readFileSync(path.join(rootDir, 'dist-base/index.html'), 'utf8'));
    const video = based.querySelector('[data-testid="hero"] video[data-hero-video]');
    expect(video?.getAttribute('data-src-mp4')).toBe('/mptour/media/hero.mp4');
    expect(video?.getAttribute('data-src-webm')).toBe('/mptour/media/hero.webm');
    expect(video?.hasAttribute('src')).toBe(false);
  });
});
