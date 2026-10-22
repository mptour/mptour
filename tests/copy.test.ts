import { describe, expect, it } from 'vitest';
import { chrome, en, es, notices, pt } from '../src/i18n';
import { isCopy } from '../src/i18n/mark';

const imageIds = new Set([
  'falls-br',
  'falls-ar',
  'itaipu',
  'paraguay',
  'frontier',
  'exp-san-martin',
  'exp-walkway',
  'exp-itaipu',
  'exp-bridge',
  'exp-curtain',
]);

function assertMarked(value: unknown, path: string) {
  if (typeof value === 'string') {
    expect(imageIds.has(value), `${path} is an unmarked string`).toBe(true);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertMarked(item, `${path}[${index}]`));
    return;
  }
  if (isCopy(value)) return;
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) assertMarked(child, `${path}.${key}`);
  }
}

function collectCopy(value: unknown): string[] {
  if (isCopy(value)) return [value.text];
  if (Array.isArray(value)) return value.flatMap((item) => collectCopy(item));
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap((item) => collectCopy(item));
  }
  return [];
}

/** Phrases the current home still uses, plus the clichés a local guide would not say. */
const BANNED_IN_PT = [
  /experiência única/i,
  /\bdescubra\b/i,
  /inesquecível/i,
  /privativ/i,
  /monte seu roteiro/i,
  /nada de prateleira/i,
  /nenhuma pressa/i,
  /cinco margens/i,
  /catálogo/i,
  /entrega o mapa/i,
];

describe('copy', () => {
  it('marks every Portuguese string and leaves ES/EN marketing empty', () => {
    assertMarked(pt, 'pt');
    assertMarked(chrome, 'chrome');
    assertMarked(notices, 'notices');
    expect(es).toEqual({});
    expect(en).toEqual({});
  });

  it('keeps agency clichés out of the Portuguese copy', () => {
    const copy = collectCopy(pt).join('\n');
    for (const pattern of BANNED_IN_PT) {
      expect(copy, pattern.source).not.toMatch(pattern);
    }
  });

  it('invites the tourist to call on WhatsApp, in the você form', () => {
    const copy = collectCopy(pt).join('\n');
    expect(pt.plan.cta.text).toBe('Chama a gente no WhatsApp');
    expect(pt.hero.cta.text).toMatch(/whatsapp/i);
    expect(pt.nav.cta.text).toMatch(/whatsapp/i);
    expect(copy).toMatch(/você/i);
  });

  it('rewrites the map prompt and keeps the region names', () => {
    expect(pt.regionMap.points.map((point) => point.name.text)).toEqual([
      'Cataratas lado brasileiro',
      'Cataratas lado argentino',
      'Itaipu',
      'Paraguai (Ciudad del Este)',
      'Marco das Três Fronteiras',
    ]);
    expect(pt.regionMap.countries.br.text).toBe('Brasil');
    expect(pt.regionMap.countries.ar.text).toBe('Argentina');
    expect(pt.regionMap.countries.py.text).toBe('Paraguai');
    for (const point of pt.regionMap.points) {
      expect(point.name.text.startsWith(point.label.text), point.name.text).toBe(true);
    }

    const prompt = [
      pt.regionMap.title.text,
      pt.regionMap.idleMeta.text,
      pt.regionMap.idleTitle.text,
      pt.regionMap.idleText.text,
      pt.regionMap.link.text,
    ].join('\n');
    expect(prompt).not.toMatch(/ver território/i);
    expect(prompt).not.toMatch(/toque um ponto/i);
    expect(prompt).not.toMatch(/escolha um lugar/i);
  });
});
