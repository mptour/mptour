import type { Locale } from '../config/whatsapp';

/** Locale home, already prefixed with the Astro base (`/` or `/mptour/`). */
export function localeHref(locale: Locale): string {
  const base = import.meta.env.BASE_URL;
  if (locale === 'pt') return base;
  return `${base}${locale}/`;
}

export function absoluteUrl(pathname = import.meta.env.BASE_URL): string {
  const site = 'https://mptour.github.io';
  return new URL(pathname, site).href;
}
