import type { Locale } from '../config/whatsapp';
import { htmlLang } from '../i18n/ui';

/** Locale home, already prefixed with the Astro base (`/` or `/mptour/`). */
export function localeHref(locale: Locale): string {
  const base = import.meta.env.BASE_URL;
  if (locale === 'pt') return base;
  return `${base}${locale}/`;
}

/** Home section. Hash-only links break on other pages and bare paths 404. */
export function sectionHref(locale: Locale, id: string): string {
  return `${localeHref(locale)}#${id}`;
}

export function absoluteUrl(pathname = import.meta.env.BASE_URL): string {
  const site = 'https://mptour.github.io';
  return new URL(pathname, site).href;
}

/** Home-cluster alternates. Only the three homes advertise every locale. */
export function localeAlternates(): { hreflang: string; href: string }[] {
  const home = absoluteUrl(localeHref('pt'));
  return [
    { hreflang: htmlLang.pt, href: home },
    { hreflang: htmlLang.es, href: absoluteUrl(localeHref('es')) },
    { hreflang: htmlLang.en, href: absoluteUrl(localeHref('en')) },
    { hreflang: 'x-default', href: home },
  ];
}

/**
 * Credits exist only in Portuguese. The missing page has no language alternate.
 * Every other page is one of the three homes.
 */
export function alternatesFor(pathname: string): { hreflang: string; href: string }[] {
  if (pathname.includes('404')) return [];
  if (pathname.includes('/creditos')) {
    return [{ hreflang: htmlLang.pt, href: absoluteUrl(pathname) }];
  }
  return localeAlternates();
}
