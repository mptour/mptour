import { getImage } from 'astro:assets';
import { stills } from '../assets/media';
import type { Locale } from '../config/whatsapp';

/**
 * Full-bleed hero. 750w is the Lighthouse mobile slot (412 CSS px × 1.75).
 * Larger steps cover phones at 2–3x and desktop without serving 1280w to that phone.
 */
export const HERO_WIDTHS = [750, 1080, 1440, 1920, 2560] as const;
export const HERO_SIZES = '100vw';
export const HERO_QUALITY = 78;

const MOBILE_VIEWPORT_CSS_PX = 412;
const MOBILE_DPR = 1.75;

type HeroImage = Awaited<ReturnType<typeof getImage>>;

export async function loadHeroImages(locale: Locale) {
  const shared = {
    src: stills.hero.src,
    widths: [...HERO_WIDTHS],
    sizes: HERO_SIZES,
    quality: HERO_QUALITY,
  };
  const [avif, webp, jpeg] = await Promise.all([
    getImage({ ...shared, format: 'avif' }),
    getImage({ ...shared, format: 'webp' }),
    getImage({ ...shared, format: 'jpeg' }),
  ]);
  return {
    avif,
    webp,
    jpeg,
    sizes: HERO_SIZES,
    alt: stills.hero.alt[locale],
  };
}

function widthOf(descriptor: string | undefined) {
  return Number.parseInt(descriptor ?? '', 10);
}

/** Smallest candidate that covers the Lighthouse mobile slot. */
export function mobileHeroSrc(image: HeroImage) {
  const target = MOBILE_VIEWPORT_CSS_PX * MOBILE_DPR;
  const values = [...image.srcSet.values].sort(
    (a, b) => widthOf(a.descriptor) - widthOf(b.descriptor),
  );
  const selected = values.find((item) => widthOf(item.descriptor) >= target) ?? values.at(-1);
  if (!selected?.url) throw new Error('Hero image srcset is empty');
  return selected.url;
}

export function largestHeroSrc(image: HeroImage) {
  const selected = image.srcSet.values.reduce((best, item) =>
    widthOf(item.descriptor) > widthOf(best.descriptor) ? item : best,
  );
  if (!selected?.url) throw new Error('Hero image srcset is empty');
  return selected.url;
}
