import type { ImageMetadata } from 'astro';
import type { Locale } from '../config/whatsapp';
import expBridge from './exp-bridge.jpg';
import expCurtain from './exp-curtain.jpg';
import expItaipu from './exp-itaipu.jpg';
import expSanMartin from './exp-san-martin.jpg';
import expWalkway from './exp-walkway.jpg';
import fallsAr from './falls-ar.jpg';
import fallsBr from './falls-br.jpg';
import frontier from './frontier.jpg';
import hero from './hero.jpg';
import itaipu from './itaipu.jpg';
import paraguay from './paraguay.jpg';

export interface Still {
  src: ImageMetadata;
  alt: Record<Locale, string>;
}

function alt(pt: string, es: string, en: string): Record<Locale, string> {
  return { pt, es, en };
}

/**
 * Provisional Wikimedia stills, not MPTour photography.
 * Alt text describes what each photo shows, in each locale. Each file is used once.
 */
export const stills = {
  hero: {
    src: hero,
    alt: alt(
      'Garganta do Diabo: água branca caindo em névoa sob nuvens, com mata no horizonte',
      'Garganta del Diablo: agua blanca cayendo en niebla bajo las nubes, con selva en el horizonte',
      "Devil's Throat: white water falling into mist under the clouds, with forest on the horizon",
    ),
  },
  'falls-br': {
    src: fallsBr,
    alt: alt(
      'Passarela com pessoas sobre o rio marrom, cortinas de queda e névoa ao fundo, lado brasileiro',
      'Pasarela con personas sobre el río marrón, cortinas de agua y niebla al fondo, lado brasileño',
      'A walkway with people over the brown river, falling curtains and mist behind, on the Brazilian side',
    ),
  },
  'falls-ar': {
    src: fallsAr,
    alt: alt(
      'Saltos das Cataratas em meio à mata verde, lado argentino',
      'Saltos de las Cataratas entre la selva verde, lado argentino',
      'Falls among the green forest, on the Argentine side',
    ),
  },
  itaipu: {
    src: itaipu,
    alt: alt(
      'Vista aérea da barragem curva de Itaipu, vertedouro com água branca e lago azul',
      'Vista aérea de la represa curva de Itaipú, vertedero con agua blanca y lago azul',
      'Aerial view of the curved Itaipu dam, a spillway with white water and a blue lake',
    ),
  },
  paraguay: {
    src: paraguay,
    alt: alt(
      'Ponte da Amizade com ônibus, o rio e um morro verde ao fundo',
      'Puente de la Amistad con un ómnibus, el río y un cerro verde al fondo',
      'Friendship Bridge with a bus, the river, and a green hill behind',
    ),
  },
  frontier: {
    src: frontier,
    alt: alt(
      'Marco branco com os escudos de Paraguai, Argentina e Brasil, rio e árvores',
      'Hito blanco con los escudos de Paraguay, Argentina y Brasil, río y árboles',
      'A white landmark with the shields of Paraguay, Argentina, and Brazil, river and trees',
    ),
  },
  'exp-san-martin': {
    src: expSanMartin,
    alt: alt(
      'Rio marrom e pedras na borda do Salto San Martín, mata ao fundo',
      'Río marrón y piedras en el borde del Salto San Martín, selva al fondo',
      'Brown river and rocks at the edge of San Martín Falls, forest behind',
    ),
  },
  'exp-walkway': {
    src: expWalkway,
    alt: alt(
      'Passarela metálica molhada com uma pessoa, quedas e névoa',
      'Pasarela metálica mojada con una persona, saltos y niebla',
      'A wet metal walkway with one person, falls, and mist',
    ),
  },
  'exp-itaipu': {
    src: expItaipu,
    alt: alt(
      'Face de concreto da barragem de Itaipu sob céu nublado, rio embaixo',
      'Cara de hormigón de la represa de Itaipú bajo un cielo nublado, con el río abajo',
      'The concrete face of the Itaipu dam under a cloudy sky, river below',
    ),
  },
  'exp-bridge': {
    src: expBridge,
    alt: alt(
      'Ponte da Amizade do lado paraguaio, caminhões, rio e Ciudad del Este',
      'Puente de la Amistad del lado paraguayo, camiones, el río y Ciudad del Este',
      'Friendship Bridge on the Paraguayan side, trucks, the river, and Ciudad del Este',
    ),
  },
  'exp-curtain': {
    src: expCurtain,
    alt: alt(
      'Cortina da Garganta do Diabo, água branca e névoa, mata no topo',
      'Cortina de la Garganta del Diablo, agua blanca y niebla, selva en lo alto',
      "The Devil's Throat curtain, white water and mist, forest along the top",
    ),
  },
} satisfies Record<string, Still>;

/** Social image (`public/og.jpg`): the walkway in front of the Falls curtain. */
export const ogImageAlt: Record<Locale, string> = {
  pt: 'Passarela com pessoas diante da cortina das Cataratas, névoa e mata',
  es: 'Pasarela con personas frente a la cortina de las Cataratas, niebla y selva',
  en: 'A walkway with people in front of the Falls curtain, mist, and forest',
};

/** Crop the same still differently in the mosaic and in the cards. */
export const focal = {
  tile: {
    'falls-br': '50% 62%',
    'falls-ar': '48% 46%',
    itaipu: '50% 48%',
    paraguay: '50% 55%',
    frontier: '50% 58%',
  },
  card: {
    'exp-san-martin': '50% 42%',
    'exp-walkway': '50% 60%',
    'exp-itaipu': '50% 45%',
    'exp-bridge': '50% 50%',
    'exp-curtain': '50% 40%',
  },
} as const;
