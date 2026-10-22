import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const html = readFileSync(path.join(rootDir, 'dist/index.html'), 'utf8');
const root = parse(html);

/** Hard ceiling from the acceptance budget. Encodes should land well under this. */
const MAX_BYTES = 2 * 1024 * 1024;

/** Top-level rules only, so a media-query override is not treated as the resting size. */
function withoutAtBlocks(source: string) {
  let out = '';
  for (let i = 0; i < source.length; i += 1) {
    if (source.startsWith('@media', i) || source.startsWith('@keyframes', i)) {
      const open = source.indexOf('{', i);
      let depth = 0;
      let j = open;
      for (; j < source.length; j += 1) {
        if (source[j] === '{') depth += 1;
        else if (source[j] === '}') {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      i = j;
      continue;
    }
    out += source[i];
  }
  return out;
}

function declarations(source: string, selector: string) {
  const decls: Record<string, string> = {};
  for (const match of withoutAtBlocks(source).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = match[1].split(',').map((item) => item.trim().replace(/\s+/g, ' '));
    if (!selectors.includes(selector)) continue;
    for (const part of match[2].split(';')) {
      const [rawProp, ...rest] = part.split(':');
      if (!rawProp || rest.length === 0) continue;
      decls[rawProp.trim()] = rest.join(':').trim();
    }
  }
  return decls;
}

function remPx(value: string, rootPx: number) {
  const match = value.trim().match(/^([\d.]+)rem$/);
  if (!match) throw new Error(`expected a rem length, got ${value}`);
  return Number(match[1]) * rootPx;
}

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
    const alt = still?.getAttribute('alt') ?? '';
    expect(alt).toMatch(/Garganta do Diabo/);
    expect(alt).not.toMatch(/PLACEHOLDER/);

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

  it('renders the pause control at least 44px tall', () => {
    const css = readFileSync(path.join(rootDir, 'src/styles/global.css'), 'utf8');
    const button = declarations(css, '.hero-playback');
    const body = declarations(css, 'body');
    const rootPx = 16;
    const fontSize = remPx(button['font-size'], rootPx);
    const lineHeight = Number(body['line-height']) * fontSize;
    const padding = remPx(button['padding-block'], rootPx) * 2;
    const minHeight = button['min-height'] ? remPx(button['min-height'], rootPx) : 0;
    const height = Math.max(lineHeight + padding, minHeight);
    expect(height, `pause control renders at ${height.toFixed(1)}px`).toBeGreaterThanOrEqual(44);
  });

  it('prefixes the clip URLs when the site is served from /mptour', () => {
    const based = parse(readFileSync(path.join(rootDir, 'dist-base/index.html'), 'utf8'));
    const video = based.querySelector('[data-testid="hero"] video[data-hero-video]');
    expect(video?.getAttribute('data-src-mp4')).toBe('/mptour/media/hero.mp4');
    expect(video?.getAttribute('data-src-webm')).toBe('/mptour/media/hero.webm');
    expect(video?.hasAttribute('src')).toBe(false);
  });
});
