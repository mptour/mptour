import { describe, expect, it } from 'vitest';
import {
  WHATSAPP_DISPLAY,
  WHATSAPP_E164,
  WHATSAPP_MESSAGE,
  WHATSAPP_URL,
  whatsappHref,
} from '../src/config/whatsapp';

describe('whatsapp config', () => {
  it('is the official number and builds locale links from that single constant', () => {
    expect(WHATSAPP_E164).toBe('554599272309');
    expect(WHATSAPP_DISPLAY).toBe('+55 45 9927-2309');
    expect(WHATSAPP_URL).toBe('https://wa.me/554599272309');

    for (const locale of ['pt', 'es', 'en'] as const) {
      const href = whatsappHref(locale);
      const url = new URL(href);
      expect(url.origin + url.pathname).toBe(WHATSAPP_URL);
      expect(url.searchParams.get('text')).toBe(WHATSAPP_MESSAGE[locale]);
      expect(WHATSAPP_MESSAGE[locale]).not.toMatch(/PLACEHOLDER/);
    }

    const custom = new URL(whatsappHref('pt', 'Quero um dia nas Cataratas.'));
    expect(custom.origin + custom.pathname).toBe(WHATSAPP_URL);
    expect(custom.searchParams.get('text')).toBe('Quero um dia nas Cataratas.');
  });
});
