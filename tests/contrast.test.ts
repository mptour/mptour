import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');

type Rgba = { r: number; g: number; b: number; a: number };

const MIN_TEXT = 4.5;

function channel(value: number) {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(color: Rgba) {
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}

function contrast(a: Rgba, b: Rgba) {
  const left = luminance(flatten(a));
  const right = luminance(flatten(b));
  const [light, dark] = left >= right ? [left, right] : [right, left];
  return (light + 0.05) / (dark + 0.05);
}

function flatten(color: Rgba, over: Rgba = { r: 255, g: 255, b: 255, a: 1 }): Rgba {
  if (color.a >= 0.999) return { ...color, a: 1 };
  const base = over.a >= 0.999 ? over : flatten(over);
  const a = color.a + base.a * (1 - color.a);
  const mix = (fg: number, bg: number) =>
    Math.round((fg * color.a + bg * base.a * (1 - color.a)) / a);
  return { r: mix(color.r, base.r), g: mix(color.g, base.g), b: mix(color.b, base.b), a };
}

function parseHex(value: string): Rgba | null {
  const hex = value.trim().replace('#', '');
  if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$|^[0-9a-f]{8}$/i.test(hex)) return null;
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => char + char)
          .join('')
      : hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const a = full.length === 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

function parseRgb(value: string): Rgba | null {
  const match = value
    .trim()
    .match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)$/i);
  if (!match) return null;
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] === undefined ? 1 : Number(match[4]),
  };
}

function rootVars(source: string) {
  const block = source.match(/:root\s*\{([^}]*)\}/)?.[1] ?? '';
  const vars: Record<string, string> = {};
  for (const match of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    vars[match[1]] = match[2].trim();
  }
  return vars;
}

const vars = rootVars(css);

function resolveColor(value: string | undefined, depth = 0): Rgba | null {
  if (!value || depth > 6) return null;
  const token = value
    .trim()
    .replace(/!important$/, '')
    .trim();
  if (token === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  const variable = token.match(/^var\((--[\w-]+)\)$/);
  if (variable) return resolveColor(vars[variable[1]], depth + 1);
  return parseHex(token) ?? parseRgb(token);
}

function stripComments(source: string) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Top-level rules only. Media queries are checked separately when named. */
function withoutAtBlocks(source: string) {
  const text = stripComments(source);
  let out = '';
  for (let i = 0; i < text.length; i += 1) {
    if (text.startsWith('@media', i) || text.startsWith('@keyframes', i)) {
      const open = text.indexOf('{', i);
      let depth = 0;
      let j = open;
      for (; j < text.length; j += 1) {
        if (text[j] === '{') depth += 1;
        else if (text[j] === '}') {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      i = j;
      continue;
    }
    out += text[i];
  }
  return out;
}

function declarationsFor(source: string, selector: string) {
  const decls: Record<string, string> = {};
  const pattern = /([^{}]+)\{([^{}]*)\}/g;
  for (const match of source.matchAll(pattern)) {
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

function solidFrom(decls: Record<string, string>): Rgba | null {
  const explicit = resolveColor(decls['background-color']);
  if (explicit && explicit.a > 0) return explicit;
  const shorthand = decls.background;
  if (!shorthand) return explicit;
  const layers = shorthand.split(/,(?![^(]*\))/);
  for (let i = layers.length - 1; i >= 0; i -= 1) {
    const layer = layers[i].trim();
    if (/gradient\(/i.test(layer)) continue;
    const color = layer.split(/\s+/)[0];
    const resolved = resolveColor(color);
    if (resolved) return resolved;
  }
  return null;
}

function painted(selector: string, source = withoutAtBlocks(css)) {
  const decls = declarationsFor(source, selector);
  return {
    decls,
    color: resolveColor(decls.color),
    background: solidFrom(decls),
    opacity: decls.opacity === undefined ? 1 : Number(decls.opacity),
  };
}

function mustColor(color: Rgba | null, name: string): Rgba {
  if (!color) throw new Error(`${name} is missing`);
  return color;
}

const body = painted('body');
const paper = mustColor(body.background ?? resolveColor(vars['--paper']), 'body background');

function backdrop(chain: string[], source?: string): Rgba {
  let bg = paper;
  for (const selector of chain) {
    const layer = painted(selector, source).background;
    if (!layer) continue;
    bg = layer.a >= 0.999 ? layer : flatten(layer, bg);
  }
  return bg;
}

function ink(selector: string, fallback: Rgba, source?: string) {
  return painted(selector, source).color ?? fallback;
}

function pair(name: string, fg: Rgba, bg: Rgba, min = MIN_TEXT) {
  const ratio = contrast(fg, bg);
  expect(ratio, `${name} contrast ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(min);
}

describe('home contrast', () => {
  it('keeps light type on a solid dark plate instead of the paper behind the photo', () => {
    const hero = painted('.hero');
    const heroInk = hero.color ?? { r: 0, g: 0, b: 0, a: 1 };
    const heroBg = backdrop(['.hero']);
    pair('hero type on hero plate', heroInk, heroBg);

    const lede = ink('.lede', heroInk);
    pair('hero lede', lede, backdrop(['.hero', '.hero-copy']));

    const tileInk = painted('.tile').color ?? heroInk;
    pair('tile type', tileInk, backdrop(['.tile']));

    const meta = ink('.tile .meta', tileInk);
    pair('tile meta', meta, backdrop(['.tile', '.tile figcaption']));

    const mark = ink('.mark', meta);
    pair('tile placeholder mark', mark, backdrop(['.tile', '.tile figcaption']));
  });

  it('does not fade draft locales below AA', () => {
    const draft = painted('.locales a[data-draft]');
    expect(draft.opacity, 'draft locales use a solid color, not opacity').toBe(1);

    const headerBg = backdrop(['.header', '.has-js .header:not([data-solid]):not([data-open])']);
    const headerInk = ink(
      '.has-js .header:not([data-solid]):not([data-open])',
      ink('.header', paper),
    );
    pair('header at rest', headerInk, headerBg);

    const draftInk = draft.color ?? headerInk;
    const faded =
      draft.opacity < 1 ? flatten({ ...draftInk, a: draft.opacity }, headerBg) : draftInk;
    pair('draft locale on the masthead', faded, headerBg);

    const openBg = backdrop(['.header', '.header[data-open]']);
    const openInk = ink('.header[data-open]', headerInk);
    pair('open menu', openInk, openBg);
    const openDraft =
      painted('.header[data-open] .locales a[data-draft]').color ?? draft.color ?? faded;
    pair('draft locale in the open menu', openDraft, openBg);

    const footerBg = backdrop(['.footer']);
    const footerDraft =
      painted('.footer .locales a[data-draft]').color ?? draft.color ?? ink('.footer', openInk);
    pair('draft locale in the footer', footerDraft, footerBg);
    pair('footer credits link', ink('.credits-link', ink('.footer', openInk)), footerBg);
  });

  it('meets AA on paper, forest, and the hero plate over white', () => {
    pair('body text', ink('body', paper), paper);
    pair('kicker', ink('.kicker', ink('body', paper)), paper);
    pair('card meta', ink('.card .meta', ink('.kicker', paper)), paper);
    pair('plan kicker', ink('.plan .kicker', ink('.plan', paper)), backdrop(['.plan']));
    pair('plan note', ink('.plan .note', ink('.plan', paper)), backdrop(['.plan']));

    const cream = mustColor(resolveColor(vars['--cream']), 'cream');
    const plate = mustColor(resolveColor(vars['--plate']), 'plate');
    pair('hero cream on the plate over white', cream, flatten(plate));
  });
});
