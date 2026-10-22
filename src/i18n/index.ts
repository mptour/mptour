import type { Locale } from '../config/whatsapp';
import { en } from './en';
import { isCopy, type Dictionary } from './mark';
import { es } from './es';
import { pt } from './pt';

const extras = { es, en } as const;

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

/** A locale is translated when every piece of copy is present, not just a few strings. */
function covers(base: unknown, extra: unknown): boolean {
  if (isCopy(base)) return isCopy(extra);
  if (Array.isArray(base)) {
    return (
      Array.isArray(extra) &&
      extra.length === base.length &&
      base.every((item, index) => covers(item, extra[index]))
    );
  }
  if (base && typeof base === 'object') {
    if (!extra || typeof extra !== 'object' || Array.isArray(extra)) return false;
    const over = extra as Record<string, unknown>;
    return Object.entries(base as Record<string, unknown>).every(([key, value]) => {
      if (isCopy(value) || Array.isArray(value) || (value && typeof value === 'object')) {
        return key in over && covers(value, over[key]);
      }
      return true;
    });
  }
  return true;
}

export function isTranslated(locale: Locale): boolean {
  if (locale === 'pt') return true;
  return covers(pt, extras[locale]);
}

export function t(locale: Locale): { dict: Dictionary; untranslated: boolean } {
  if (locale === 'pt') return { dict: pt, untranslated: false };
  const extra = extras[locale];
  const untranslated = !isTranslated(locale);
  return { dict: untranslated ? merge(pt, extra) : extra, untranslated };
}

export { chrome, htmlLang, notices, ogLocale } from './ui';
export { en, es, pt };
export type { Copy, Dictionary } from './mark';
