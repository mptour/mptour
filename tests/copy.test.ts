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

const BANNED_IN_ES = [
  /experiencia única/i,
  /\bdescubra\b/i,
  /inolvidable/i,
  /\bmágic/i,
  /imperdible/i,
  /paraíso/i,
  /\bexclusiv/i,
  /déjese/i,
  /catálogo/i,
];

describe('copy', () => {
  it('marks every Portuguese, Spanish, and English string', () => {
    assertMarked(pt, 'pt');
    assertMarked(es, 'es');
    assertMarked(en, 'en');
    assertMarked(chrome, 'chrome');
    assertMarked(notices, 'notices');
  });

  it('keeps agency clichés out of the Portuguese copy', () => {
    const copy = collectCopy(pt).join('\n');
    for (const pattern of BANNED_IN_PT) {
      expect(copy, pattern.source).not.toMatch(pattern);
    }
  });

  it('invites the tourist to call on WhatsApp, in the formal você imperative', () => {
    const copy = collectCopy(pt).join('\n');
    expect(pt.plan.cta.text).toBe('Chame a gente no WhatsApp');
    expect(pt.hero.cta.text).toBe('Chame no WhatsApp');
    expect(pt.nav.cta.text).toBe('Chame no WhatsApp');
    expect(pt.plan.title.text).toBe('Mande um oi. A gente responde daqui.');
    expect(pt.missing.link.text).toBe('Volte pro começo');
    expect(pt.plan.text.text).toContain('espanhol');
    expect(copy).not.toMatch(/español/);
    expect(copy).not.toMatch(/PLACEHOLDER/);
    expect(copy).not.toMatch(/\bChama\b|\bManda\b|\bEscolhe\b|\bOlha\b|\bVolta\b/);
    expect(copy).toMatch(/você/i);
  });

  it('keeps the confirmed guide facts and leaves duration flexible', () => {
    expect(pt.manifesto.facts.map((fact) => fact.text)).toEqual([
      'Passeio particular',
      'Guia que mora em Foz',
      'Brasil, Argentina, Paraguai',
    ]);
    expect(pt.experiences.lede.text).toContain('Meio dia, dia inteiro, vários dias ou sob medida.');
    expect(pt.experiences.items.map((item) => item.duration.text)).toEqual([
      'Do jeito que você quiser',
      'Do jeito que você quiser',
      'Do jeito que você quiser',
      'Do jeito que você quiser',
      'Do jeito que você quiser',
    ]);
    expect(pt.experiences.items.map((item) => item.title.text).join('\n')).not.toMatch(
      /num dia|dois dias|dia inteiro|meio dia/i,
    );
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
    expect(pt.regionMap.idleTitle.text).toBe('Escolha um lugar.');
    expect(pt.regionMap.link.text).toBe('Olhe esse lugar');
    expect(prompt).not.toMatch(/ver território/i);
    expect(prompt).not.toMatch(/toque um ponto/i);
  });

  it('speaks to Argentine and Paraguayan visitors in the formal usted imperative', () => {
    const copy = collectCopy(es).join('\n');
    for (const pattern of BANNED_IN_ES) {
      expect(copy, pattern.source).not.toMatch(pattern);
    }
    expect(es.plan.cta.text).toBe('Escríbanos por WhatsApp');
    expect(es.hero.cta.text).toBe('Escríbanos por WhatsApp');
    expect(es.nav.cta.text).toBe('Escríbanos por WhatsApp');
    expect(es.regionMap.idleTitle.text).toBe('Elija un lugar.');
    expect(es.regionMap.link.text).toBe('Mire este lugar');
    expect(es.missing.link.text).toBe('Vuelva al inicio');
    expect(es.meta.title.text).toBe('MPTour — paseos en Foz do Iguaçu');
    expect(es.meta.description.text).toContain('Itaipú');
    expect(copy).not.toMatch(/PLACEHOLDER/);
    expect(copy).not.toMatch(/\bvocê\b/i);
    expect(copy).not.toMatch(/\b(escribí|mirá|elegí|volvé|andá)\b/i);
  });

  it('keeps the Spanish guide facts and leaves duration flexible', () => {
    expect(es.manifesto.facts.map((fact) => fact.text)).toEqual([
      'Paseo privado',
      'Guía que vive en Foz',
      'Brasil, Argentina, Paraguay',
    ]);
    expect(es.experiences.lede.text).toContain('Medio día, día entero, varios días o a medida.');
    expect(es.experiences.items.map((item) => item.duration.text)).toEqual([
      'Como usted quiera',
      'Como usted quiera',
      'Como usted quiera',
      'Como usted quiera',
      'Como usted quiera',
    ]);
  });

  it('translates map region names and keeps each label a prefix of the name', () => {
    expect(es.regionMap.points.map((point) => point.name.text)).toEqual([
      'Cataratas lado brasileño',
      'Cataratas lado argentino',
      'Itaipú',
      'Paraguay (Ciudad del Este)',
      'Hito de las Tres Fronteras',
    ]);
    expect(es.regionMap.points.map((point) => point.label.text)).toEqual([
      'Cataratas',
      'Cataratas',
      'Itaipú',
      'Paraguay',
      'Hito',
    ]);
    expect(es.regionMap.countries.py.text).toBe('Paraguay');
    for (const point of es.regionMap.points) {
      expect(point.name.text.startsWith(point.label.text), point.name.text).toBe(true);
    }
  });
});
