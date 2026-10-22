import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { stills } from '../src/assets/media';
import type { Locale } from '../src/config/whatsapp';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);

/** The eleven stills, in the order the home renders them. */
const PHOTO_ORDER = [
  'hero',
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
] as const;

const ALT: Record<(typeof PHOTO_ORDER)[number], Record<Locale, string>> = {
  hero: {
    pt: 'Garganta do Diabo: água branca caindo em névoa sob nuvens, com mata no horizonte',
    es: 'Garganta del Diablo: agua blanca cayendo en niebla bajo las nubes, con selva en el horizonte',
    en: "Devil's Throat: white water falling into mist under the clouds, with forest on the horizon",
  },
  'falls-br': {
    pt: 'Passarela com pessoas sobre o rio marrom, cortinas de queda e névoa ao fundo, lado brasileiro',
    es: 'Pasarela con personas sobre el río marrón, cortinas de agua y niebla al fondo, lado brasileño',
    en: 'A walkway with people over the brown river, falling curtains and mist behind, on the Brazilian side',
  },
  'falls-ar': {
    pt: 'Saltos das Cataratas em meio à mata verde, lado argentino',
    es: 'Saltos de las Cataratas entre la selva verde, lado argentino',
    en: 'Falls among the green forest, on the Argentine side',
  },
  itaipu: {
    pt: 'Vista aérea da barragem curva de Itaipu, vertedouro com água branca e lago azul',
    es: 'Vista aérea de la represa curva de Itaipú, vertedero con agua blanca y lago azul',
    en: 'Aerial view of the curved Itaipu dam, a spillway with white water and a blue lake',
  },
  paraguay: {
    pt: 'Ponte da Amizade com ônibus, o rio e um morro verde ao fundo',
    es: 'Puente de la Amistad con un ómnibus, el río y un cerro verde al fondo',
    en: 'Friendship Bridge with a bus, the river, and a green hill behind',
  },
  frontier: {
    pt: 'Marco branco com os escudos de Paraguai, Argentina e Brasil, rio e árvores',
    es: 'Hito blanco con los escudos de Paraguay, Argentina y Brasil, río y árboles',
    en: 'A white landmark with the shields of Paraguay, Argentina, and Brazil, river and trees',
  },
  'exp-san-martin': {
    pt: 'Rio marrom e pedras na borda do Salto San Martín, mata ao fundo',
    es: 'Río marrón y piedras en el borde del Salto San Martín, selva al fondo',
    en: 'Brown river and rocks at the edge of San Martín Falls, forest behind',
  },
  'exp-walkway': {
    pt: 'Passarela metálica molhada com uma pessoa, quedas e névoa',
    es: 'Pasarela metálica mojada con una persona, saltos y niebla',
    en: 'A wet metal walkway with one person, falls, and mist',
  },
  'exp-itaipu': {
    pt: 'Face de concreto da barragem de Itaipu sob céu nublado, rio embaixo',
    es: 'Cara de hormigón de la represa de Itaipú bajo un cielo nublado, con el río abajo',
    en: 'The concrete face of the Itaipu dam under a cloudy sky, river below',
  },
  'exp-bridge': {
    pt: 'Ponte da Amizade do lado paraguaio, caminhões, rio e Ciudad del Este',
    es: 'Puente de la Amistad del lado paraguayo, camiones, el río y Ciudad del Este',
    en: 'Friendship Bridge on the Paraguayan side, trucks, the river, and Ciudad del Este',
  },
  'exp-curtain': {
    pt: 'Cortina da Garganta do Diabo, água branca e névoa, mata no topo',
    es: 'Cortina de la Garganta del Diablo, agua blanca y niebla, selva en lo alto',
    en: "The Devil's Throat curtain, white water and mist, forest along the top",
  },
};

const OG_ALT: Record<Locale, string> = {
  pt: 'Passarela com pessoas diante da cortina das Cataratas, névoa e mata',
  es: 'Pasarela con personas frente a la cortina de las Cataratas, niebla y selva',
  en: 'A walkway with people in front of the Falls curtain, mist, and forest',
};

function readPage(outDir: string, page: string) {
  const file = path.join(rootDir, outDir, page);
  expect(existsSync(file), `${outDir}/${page} should exist`).toBe(true);
  return parse(readFileSync(file, 'utf8'));
}

describe('photo alts', () => {
  it('stores a Portuguese, Spanish, and English alt for each of the 11 photos', () => {
    expect(Object.keys(stills).sort()).toEqual([...PHOTO_ORDER].sort());
    for (const id of PHOTO_ORDER) {
      expect(stills[id].alt, id).toEqual(ALT[id]);
    }
  });

  it('renders each photo alt in the language of the page', () => {
    for (const [page, locale] of [
      ['index.html', 'pt'],
      ['es/index.html', 'es'],
      ['en/index.html', 'en'],
    ] as const) {
      const alts = readPage('dist', page)
        .querySelectorAll('img')
        .map((image) => image.getAttribute('alt'));
      expect(alts, page).toEqual(PHOTO_ORDER.map((id) => ALT[id][locale]));
    }
  });

  it('writes og:image:alt in the language of the page', () => {
    for (const [page, locale] of [
      ['index.html', 'pt'],
      ['es/index.html', 'es'],
      ['en/index.html', 'en'],
      ['creditos/index.html', 'pt'],
      ['404.html', 'pt'],
    ] as const) {
      const content = readPage('dist', page)
        .querySelector('meta[property="og:image:alt"]')
        ?.getAttribute('content');
      expect(content, page).toBe(OG_ALT[locale]);
    }
    const based = readPage('dist-base', 'en/index.html')
      .querySelector('meta[property="og:image:alt"]')
      ?.getAttribute('content');
    expect(based).toBe(OG_ALT.en);
  });
});
