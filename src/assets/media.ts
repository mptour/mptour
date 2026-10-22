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
 * Alt text stays marked. Each file is used once — mosaic and cards do not share a photo.
 */
export const stills = {
  hero: { src: hero, alt: 'PLACEHOLDER — Garganta do Diabo, Cataratas do Iguaçu' },
  'falls-br': { src: fallsBr, alt: 'PLACEHOLDER — passarela brasileira, Cataratas do Iguaçu' },
  'falls-ar': { src: fallsAr, alt: 'PLACEHOLDER — Salto San Martín, lado argentino' },
  itaipu: { src: itaipu, alt: 'PLACEHOLDER — Usina de Itaipu' },
  paraguay: { src: paraguay, alt: 'PLACEHOLDER — Ponte da Amizade, Foz do Iguaçu' },
  frontier: { src: frontier, alt: 'PLACEHOLDER — marco das Três Fronteiras' },
  'exp-san-martin': { src: expSanMartin, alt: 'PLACEHOLDER — borda do Salto San Martín' },
  'exp-walkway': { src: expWalkway, alt: 'PLACEHOLDER — passarela sobre as cataratas' },
  'exp-itaipu': { src: expItaipu, alt: 'PLACEHOLDER — vertedouro de Itaipu' },
  'exp-bridge': { src: expBridge, alt: 'PLACEHOLDER — ponte entre Foz do Iguaçu e Ciudad del Este' },
  'exp-curtain': { src: expCurtain, alt: 'PLACEHOLDER — cortina da Garganta do Diabo' },
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
