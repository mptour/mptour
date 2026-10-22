// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import { bindMap, cardFromHash } from '../src/scripts/map';

const fixture = `
  <div data-region-map>
    <a data-pin="itaipu" href="#mapa-itaipu">Itaipu</a>
    <a data-pin="paraguay" href="#mapa-paraguai">Paraguai</a>
    <a data-pin="frontier" href="#mapa-tres-fronteiras">Marco</a>
    <article id="mapa-itaipu" data-card="itaipu" tabindex="-1"></article>
    <article id="mapa-paraguai" data-card="paraguay" tabindex="-1"></article>
    <article id="mapa-tres-fronteiras" data-card="frontier" tabindex="-1"></article>
  </div>
`;

function setup() {
  document.body.innerHTML = fixture;
  const root = document.querySelector<HTMLElement>('[data-region-map]');
  if (!root) throw new Error('missing map');
  bindMap(root);
  return {
    root,
    pins: [...root.querySelectorAll<HTMLAnchorElement>('[data-pin]')],
    cards: [...root.querySelectorAll<HTMLElement>('[data-card]')],
  };
}

describe('cardFromHash', () => {
  const ids = ['mapa-itaipu', 'mapa-paraguai'];

  it('returns a known card id and ignores other hashes', () => {
    expect(cardFromHash('#mapa-itaipu', ids)).toBe('mapa-itaipu');
    expect(cardFromHash('mapa-paraguai', ids)).toBe('mapa-paraguai');
    expect(cardFromHash('#territorios', ids)).toBeNull();
    expect(cardFromHash('', ids)).toBeNull();
    expect(cardFromHash('#', ids)).toBeNull();
  });
});

describe('bindMap', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    window.location.hash = '';
  });

  it('opens one card, switches, and closes on a second press', () => {
    const { root, pins, cards } = setup();
    pins[0]?.click();
    expect(pins[0]?.getAttribute('aria-current')).toBe('true');
    expect(cards[0]?.classList.contains('is-open')).toBe(true);
    expect(root.getAttribute('data-open')).toBe('itaipu');
    expect(document.activeElement).toBe(cards[0]);
    expect(window.location.hash).toBe('');

    pins[1]?.click();
    expect(pins[0]?.hasAttribute('aria-current')).toBe(false);
    expect(pins[1]?.getAttribute('aria-current')).toBe('true');
    expect(cards[0]?.classList.contains('is-open')).toBe(false);
    expect(cards[1]?.classList.contains('is-open')).toBe(true);

    pins[1]?.click();
    expect(root.hasAttribute('data-open')).toBe(false);
    expect(cards[1]?.classList.contains('is-open')).toBe(false);
    expect(document.activeElement).toBe(pins[1]);
  });

  it('leaves focus on the pin when the click comes from a pointer', () => {
    const { pins, cards } = setup();
    pins[2]?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
    expect(cards[2]?.classList.contains('is-open')).toBe(true);
    expect(document.activeElement).not.toBe(cards[2]);
  });

  it('closes on Escape and moves between pins with the arrow keys', () => {
    const { root, pins, cards } = setup();
    pins[0]?.click();
    cards[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(root.hasAttribute('data-open')).toBe(false);
    expect(document.activeElement).toBe(pins[0]);

    pins[0]?.focus();
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(pins[1]);
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(document.activeElement).toBe(pins[0]);
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(document.activeElement).toBe(pins[2]);
  });

  it('leaves modifier clicks to the browser and opens a card from the hash', () => {
    const { pins, cards } = setup();
    pins[0]?.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }),
    );
    expect(cards[0]?.classList.contains('is-open')).toBe(false);

    document.body.innerHTML = fixture;
    window.location.hash = '#mapa-paraguai';
    const root = document.querySelector<HTMLElement>('[data-region-map]');
    if (!root) throw new Error('missing map');
    bindMap(root);
    expect(root.getAttribute('data-open')).toBe('paraguay');
    expect(root.querySelector('#mapa-paraguai')?.classList.contains('is-open')).toBe(true);
    expect(root.querySelector('[data-pin="paraguay"]')?.getAttribute('aria-current')).toBe('true');
  });
});
