import { readFileSync } from 'node:fs';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { WHATSAPP_MESSAGE } from '../src/config/whatsapp';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const root = parse(html);

describe('home', () => {
  it('renders the cinematic hero and the Monte seu roteiro CTA', () => {
    expect(root.querySelector('html')?.getAttribute('lang')).toBe('pt-BR');

    const heroes = root.querySelectorAll('[data-testid="hero"]');
    expect(heroes).toHaveLength(1);

    expect(root.querySelectorAll('h1')).toHaveLength(1);
    const heading = heroes[0]?.querySelector('h1');
    expect(heading?.text.trim().length ?? 0).toBeGreaterThan(0);

    const cta = heroes[0]?.querySelector('[data-testid="cta-primary"]');
    expect(cta?.text.trim()).toBe('Monte seu roteiro');
    expect(cta?.getAttribute('href')).toBe('#monte-seu-roteiro');

    const plan = root.querySelector('#monte-seu-roteiro');
    const whatsapp = plan?.querySelector('[data-testid="cta-whatsapp"]');
    const href = whatsapp?.getAttribute('href') ?? '';
    const url = new URL(href);
    expect(url.origin + url.pathname).toBe('https://wa.me/554599272309');
    expect(url.searchParams.get('text')).toBe(WHATSAPP_MESSAGE.pt);
  });
});
