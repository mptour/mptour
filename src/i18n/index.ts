import type { Locale } from '../config/whatsapp';
import { en } from './en';
import { isCopy, type Dictionary } from './mark';
import { es } from './es';
import { pt } from './pt';

/** Locales with their own copy. English still falls back to Portuguese. */
const translated = new Set<Locale>(['pt', 'es']);

export function isTranslated(locale: Locale): boolean {
  return translated.has(locale);
}

function merge<T>(base: T, extra: unknown): T {
  if (extra === undefined) return base;
  if (isCopy(base)) return (isCopy(extra) ? extra : base) as T;
  if (Array.isArray(base)) {
    return (Array.isArray(extra) && extra.length > 0 ? extra : base) as T;
  }
  if (base && typeof base === 'object') {
    const source = base as Record<string, unknown>;
    const over = extra && typeof extra === 'object' ? (extra as Record<string, unknown>) : {};
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(source)) {
      out[key] = key in over ? merge(source[key], over[key]) : source[key];
    }
    return out as T;
  }
  return base;
}

export function t(locale: Locale): { dict: Dictionary; untranslated: boolean } {
  const untranslated = !isTranslated(locale);
  if (locale === 'pt') return { dict: pt, untranslated };
  if (locale === 'es') return { dict: es, untranslated };
  return { dict: merge(pt, en), untranslated };
}

export { chrome, htmlLang, notices, ogLocale } from './ui';
export { en, es, pt };
export type { Copy, Dictionary } from './mark';
