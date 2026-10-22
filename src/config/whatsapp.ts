/**
 * Official MPTour WhatsApp.
 * Every CTA — and the future quote form — must go through `whatsappHref`.
 * Do not hardcode the number anywhere else.
 */
export const WHATSAPP_E164 = '554599272309' as const;
export const WHATSAPP_DISPLAY = '+55 45 9927-2309' as const;
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_E164}` as const;

export const LOCALES = ['pt', 'es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** Pre-filled messages. These are operational, not placeholder copy. */
export const WHATSAPP_MESSAGE = {
  pt: 'Olá, MPTour. Quero montar meu roteiro em Foz do Iguaçu.',
  es: 'Hola, MPTour. Quiero armar mi itinerario en Foz do Iguaçu.',
  en: 'Hi, MPTour. I want a private tour in Foz do Iguaçu.',
} as const satisfies Record<Locale, string>;

export function whatsappHref(locale: Locale, message: string = WHATSAPP_MESSAGE[locale]): string {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}
