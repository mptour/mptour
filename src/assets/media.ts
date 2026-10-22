import type { ImageMetadata } from 'astro';
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
  alt: string;
}

/**
 * Provisional Wikimedia stills, not MPTour photography.
 * Alt text describes what each photo shows. Each file is used once — mosaic and cards do not share a photo.
 */
export const stills = {
  hero: {
    src: hero,
    alt: 'Garganta do Diabo: água branca caindo em névoa sob nuvens, com mata no horizonte',
  },
  'falls-br': {
    src: fallsBr,
    alt: 'Passarela com pessoas sobre o rio marrom, cortinas de queda e névoa ao fundo, lado brasileiro',
  },
  'falls-ar': {
    src: fallsAr,
    alt: 'Saltos das Cataratas em meio à mata verde, lado argentino',
  },
  itaipu: {
    src: itaipu,
    alt: 'Vista aérea da barragem curva de Itaipu, vertedouro com água branca e lago azul',
  },
  paraguay: {
    src: paraguay,
    alt: 'Ponte da Amizade com ônibus, o rio e um morro verde ao fundo',
  },
  frontier: {
    src: frontier,
    alt: 'Marco branco com os escudos de Paraguai, Argentina e Brasil, rio e árvores',
  },
  'exp-san-martin': {
    src: expSanMartin,
    alt: 'Rio marrom e pedras na borda do Salto San Martín, mata ao fundo',
  },
  'exp-walkway': {
    src: expWalkway,
    alt: 'Passarela metálica molhada com uma pessoa, quedas e névoa',
  },
  'exp-itaipu': {
    src: expItaipu,
    alt: 'Face de concreto da barragem de Itaipu sob céu nublado, rio embaixo',
  },
  'exp-bridge': {
    src: expBridge,
    alt: 'Ponte da Amizade do lado paraguaio, caminhões, rio e Ciudad del Este',
  },
  'exp-curtain': {
    src: expCurtain,
    alt: 'Cortina da Garganta do Diabo, água branca e névoa, mata no topo',
  },
} satisfies Record<string, Still>;

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
