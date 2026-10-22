import { readFileSync } from 'node:fs';
import { Window, type Element } from 'happy-dom';
import { afterEach, describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const page = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');

/** Phone width where the hero clip is never attached. */
const PHONE = 390;
const PHONE_HEIGHT = 844;

const open: Window[] = [];

function heroMarkup() {
  const match = page.match(/<section class="hero"[\s\S]*?<\/section>/);
  if (!match) throw new Error('built home is missing the hero');
  return match[0];
}

function mount(width: number): { view: Window; button: Element } {
  const view = new Window({
    url: 'http://127.0.0.1:4321/',
    width,
    height: PHONE_HEIGHT,
    innerWidth: width,
    innerHeight: PHONE_HEIGHT,
  });
  open.push(view);
  view.document.head.innerHTML = `<style>${css}</style>`;
  view.document.body.innerHTML = heroMarkup();
  const button = view.document.querySelector('[data-hero-playback]');
  if (!button) throw new Error('hero is missing the playback button');
  return { view, button };
}

describe('hero playback visibility', () => {
  afterEach(async () => {
    const view = open.pop();
    await view?.happyDOM.abort();
    view?.close();
  });

  it('computes the pause control as hidden at a 390px viewport', () => {
    const { view, button } = mount(PHONE);

    expect(view.innerWidth).toBe(PHONE);
    expect(view.matchMedia('(width: 390px)').matches).toBe(true);
    expect(view.matchMedia('(min-width: 1100px)').matches).toBe(false);
    expect(button.hasAttribute('hidden')).toBe(true);
    expect(button.textContent?.trim()).toBe('Pausar vídeo');

    const style = view.getComputedStyle(button);
    expect(style.display, 'hidden must win over .hero-playback { display }').toBe('none');
    expect(button.checkVisibility()).toBe(false);
  });

  it('computes the pause control as visible on desktop once the clip is playing', () => {
    const { view, button } = mount(1280);
    button.removeAttribute('hidden');

    expect(view.matchMedia('(min-width: 1100px)').matches).toBe(true);
    expect(view.getComputedStyle(button).display).toBe('inline-flex');
    expect(button.checkVisibility()).toBe(true);
  });
});
