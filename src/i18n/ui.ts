import { ph, type Copy } from './mark';
import type { Locale } from '../config/whatsapp';

export const htmlLang = {
  pt: 'pt-BR',
  es: 'es',
  en: 'en',
} as const;

export const ogLocale = {
  pt: 'pt_BR',
  es: 'es_ES',
  en: 'en_US',
} as const;

export const notices = {
  es: ph('Versión en español en preparación — mostrando el texto en portugués.'),
  en: ph('English version in preparation — showing the Portuguese text.'),
} satisfies Record<Exclude<Locale, 'pt'>, Copy>;

export const chrome = {
  pt: {
    skip: ph('Ir para o conteúdo'),
    menu: ph('Menu'),
    draft: ph('Em preparação'),
    newTab: ph('WhatsApp, abre em nova aba'),
  },
  es: {
    skip: ph('Saltar al contenido'),
    menu: ph('Menú'),
    draft: ph('En preparación'),
    newTab: ph('WhatsApp, se abre en una pestaña nueva'),
  },
  en: {
    skip: ph('Skip to content'),
    menu: ph('Menu'),
    draft: ph('In preparation'),
    newTab: ph('WhatsApp, opens in a new tab'),
  },
} satisfies Record<Locale, { skip: Copy; menu: Copy; draft: Copy; newTab: Copy }>;
