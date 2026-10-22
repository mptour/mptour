import type { ImageMetadata } from 'astro';
import fallsAr from './falls-ar.jpg';
import fallsBr from './falls-br.jpg';
import fallsWide from './falls-wide.jpg';
import frontier from './frontier.jpg';
import hero from './hero.jpg';
import itaipu from './itaipu.jpg';
import paraguay from './paraguay.jpg';

export interface Still {
  src: ImageMetadata;
  alt: string;
}

/** Every alt starts with PLACEHOLDER. These files are not final brand photography. */
export const stills = {
  hero: { src: hero, alt: 'PLACEHOLDER — Garganta do Diabo, Cataratas do Iguaçu' },
  'falls-br': { src: fallsBr, alt: 'PLACEHOLDER — Cataratas do Iguaçu, lado brasileiro' },
  'falls-ar': { src: fallsAr, alt: 'PLACEHOLDER — Salto San Martín, lado argentino' },
  'falls-wide': { src: fallsWide, alt: 'PLACEHOLDER — cortina das Cataratas do Iguaçu' },
  itaipu: { src: itaipu, alt: 'PLACEHOLDER — Usina de Itaipu, vista aérea' },
  paraguay: { src: paraguay, alt: 'PLACEHOLDER — rio Paraná entre Foz do Iguaçu e Ciudad del Este' },
  frontier: { src: frontier, alt: 'PLACEHOLDER — encontro dos rios na tríplice fronteira' },
} satisfies Record<string, Still>;

/** Crop the same still differently in the mosaic and in the cards. */
export const focal = {
  tile: {
    'falls-br': '50% 70%',
    'falls-ar': '50% 42%',
    itaipu: '50% 45%',
    paraguay: '50% 50%',
    frontier: '50% 62%',
  },
  card: {
    'falls-ar': '25% 50%',
    'falls-br': '60% 90%',
    itaipu: '50% 15%',
    paraguay: '50% 50%',
    frontier: '50% 62%',
    'falls-wide': '50% 50%',
  },
} as const;
