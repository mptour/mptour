// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  HERO_NARROW_MEDIA,
  bindSite,
  isSlowConnection,
  shouldLoadHeroVideo,
} from '../src/scripts/site';

const fixture = `
  <header data-header>
    <button type="button" data-nav-toggle aria-expanded="false">menu</button>
    <nav data-nav>
      <a href="/#territorios">Territórios</a>
    </nav>
  </header>
  <div data-reveal></div>
  <video data-hero-video data-src="/clip.mp4"></video>
`;

function installView(flags: {
  reduce: boolean;
  wide: boolean;
  saveData?: boolean;
  effectiveType?: string;
  scrollY?: number;
}) {
  const view = window as Window & typeof globalThis;
  vi.spyOn(view, 'matchMedia').mockImplementation((query: string) => {
    const matches =
      query === '(prefers-reduced-motion: reduce)'
        ? flags.reduce
        : query === HERO_NARROW_MEDIA
          ? !flags.wide
          : false;
    return {
      matches,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
      addListener() {},
      removeListener() {},
    } as MediaQueryList;
  });
  Object.defineProperty(view.navigator, 'connection', {
    configurable: true,
    value: {
      saveData: Boolean(flags.saveData),
      effectiveType: flags.effectiveType,
    },
  });
  Object.defineProperty(view, 'scrollY', {
    configurable: true,
    value: flags.scrollY ?? 0,
  });
  view.requestIdleCallback = (callback) => {
    callback({ didTimeout: false, timeRemaining: () => 50 } as IdleDeadline);
    return 1;
  };
  view.IntersectionObserver = class {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [0.16];
    constructor(private readonly onEntry: IntersectionObserverCallback) {}
    observe(target: Element) {
      this.onEntry(
        [{ isIntersecting: true, target, intersectionRatio: 1 } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
  return view;
}

describe('shouldLoadHeroVideo', () => {
  it('loads on any width that is not saving data, reducing motion, or slow', () => {
    expect(shouldLoadHeroVideo({ reduce: false, wide: true, saveData: false })).toBe(true);
    expect(shouldLoadHeroVideo({ reduce: false, wide: false, saveData: false })).toBe(true);
    expect(shouldLoadHeroVideo({ reduce: true, wide: true, saveData: false })).toBe(false);
    expect(shouldLoadHeroVideo({ reduce: false, wide: true, saveData: true })).toBe(false);
    expect(shouldLoadHeroVideo({ reduce: false, wide: true, saveData: false, slow: true })).toBe(
      false,
    );
    expect(isSlowConnection('slow-2g')).toBe(true);
    expect(isSlowConnection('2g')).toBe(true);
    expect(isSlowConnection('3g')).toBe(true);
    expect(isSlowConnection('4g')).toBe(false);
    expect(isSlowConnection(undefined)).toBe(false);
  });
});

describe('bindSite', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    Object.defineProperty(document, 'readyState', { configurable: true, value: 'complete' });
  });

  it('opens the menu, closes it from a link, and returns focus on Escape', () => {
    document.body.innerHTML = fixture;
    const view = installView({ reduce: true, wide: false });
    bindSite(document, view);

    const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
    const nav = document.querySelector('[data-nav]');
    const header = document.querySelector('[data-header]');
    expect(toggle).toBeTruthy();
    expect(nav).toBeTruthy();

    toggle?.click();
    expect(nav?.hasAttribute('data-open')).toBe(true);
    expect(header?.hasAttribute('data-open')).toBe(true);
    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
    expect(document.body.hasAttribute('data-lock')).toBe(true);

    document.querySelector('nav a')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(nav?.hasAttribute('data-open')).toBe(false);

    toggle?.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(nav?.hasAttribute('data-open')).toBe(false);
    expect(document.activeElement).toBe(toggle);
  });

  it('marks the header solid after the page scrolls past 24px', () => {
    document.body.innerHTML = fixture;
    const view = installView({ reduce: true, wide: false, scrollY: 40 });
    bindSite(document, view);
    expect(document.querySelector('[data-header]')?.hasAttribute('data-solid')).toBe(true);
  });

  it('reveals blocks that enter the viewport', () => {
    document.body.innerHTML = fixture;
    const view = installView({ reduce: false, wide: false });
    bindSite(document, view);
    expect(document.querySelector('[data-reveal]')?.classList.contains('is-in')).toBe(true);
  });

  it('assigns the hero clip when the screen is idle', () => {
    document.body.innerHTML = fixture;
    const view = installView({ reduce: false, wide: true });
    bindSite(document, view);
    const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
    expect(video?.getAttribute('src') ?? video?.src ?? '').toContain('clip.mp4');
  });

  it('assigns the single source on a narrow screen when no vertical file is set', () => {
    document.body.innerHTML = fixture;
    const narrow = installView({ reduce: false, wide: false });
    bindSite(document, narrow);
    expect(document.querySelector('[data-hero-video]')?.getAttribute('src') ?? '').toContain(
      'clip.mp4',
    );
  });

  it('leaves the hero clip unloaded on a data-saver screen', () => {
    document.body.innerHTML = fixture;
    const saver = installView({ reduce: false, wide: true, saveData: true });
    bindSite(document, saver);
    expect(document.querySelector('[data-hero-video]')?.getAttribute('src')).toBeNull();
  });

  it('plays the vertical montage on a narrow screen and the pause control still stops it', () => {
    document.body.innerHTML = `
      <img class="hero-still" src="/assets/hero.jpg" />
      <video
        data-hero-video
        data-src-webm="/media/hero.webm"
        data-src-mp4="/media/hero.mp4"
        data-src-webm-narrow="/media/hero-narrow.webm"
        data-src-mp4-narrow="/media/hero-narrow.mp4"
        aria-hidden="true"
      ></video>
      <button
        type="button"
        data-hero-playback
        data-label-pause="Pausar vídeo"
        data-label-play="Tocar vídeo"
        hidden
        aria-pressed="false"
      >
        Pausar vídeo
      </button>
    `;
    const view = installView({ reduce: false, wide: false, effectiveType: '4g' });
    bindSite(document, view);
    const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
    const button = document.querySelector<HTMLButtonElement>('[data-hero-playback]');
    expect(
      [...(video?.querySelectorAll('source') ?? [])].map((node) => node.getAttribute('src')),
    ).toEqual(['/media/hero-narrow.webm', '/media/hero-narrow.mp4']);
    expect(video?.getAttribute('src')).toBeNull();
    expect(button?.hidden).toBe(false);
    expect(video?.paused).toBe(false);
    button?.click();
    expect(video?.paused).toBe(true);
    expect(button?.textContent?.trim()).toBe('Tocar vídeo');
    expect(button?.getAttribute('aria-pressed')).toBe('true');
  });

  it('leaves the hero clip unloaded on a slow connection', () => {
    for (const effectiveType of ['slow-2g', '2g', '3g']) {
      document.body.innerHTML = fixture;
      const view = installView({ reduce: false, wide: true, effectiveType });
      bindSite(document, view);
      const video = document.querySelector('[data-hero-video]');
      expect(video?.getAttribute('src'), effectiveType).toBeNull();
      expect(video?.querySelector('source'), effectiveType).toBeNull();
    }
  });

  it('waits until the page has loaded before assigning the clip', () => {
    document.body.innerHTML = fixture;
    const view = installView({ reduce: false, wide: true, effectiveType: '4g' });
    Object.defineProperty(document, 'readyState', { configurable: true, value: 'interactive' });
    bindSite(document, view);
    expect(document.querySelector('[data-hero-video]')?.getAttribute('src')).toBeNull();
    view.dispatchEvent(new Event('load'));
    expect(document.querySelector('[data-hero-video]')?.getAttribute('src') ?? '').toContain(
      'clip.mp4',
    );
  });

  it('pauses the loaded clip from a control outside the video and resumes it', () => {
    document.body.innerHTML = `
      <video data-hero-video data-src="/clip.mp4" aria-hidden="true"></video>
      <button
        type="button"
        data-hero-playback
        data-label-pause="Pausar vídeo"
        data-label-play="Tocar vídeo"
        hidden
        aria-pressed="false"
      >
        Pausar vídeo
      </button>
    `;
    const view = installView({ reduce: false, wide: true, effectiveType: '4g' });
    bindSite(document, view);
    const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
    const button = document.querySelector<HTMLButtonElement>('[data-hero-playback]');
    expect(button).toBeTruthy();
    expect(video?.contains(button as Node)).toBe(false);
    expect(video?.getAttribute('aria-hidden')).toBe('true');
    expect(button?.hidden).toBe(false);
    expect(button?.textContent?.trim()).toBe('Pausar vídeo');
    expect(button?.getAttribute('aria-pressed')).toBe('false');
    expect(video?.paused).toBe(false);

    button?.click();
    expect(video?.paused).toBe(true);
    expect(button?.textContent?.trim()).toBe('Tocar vídeo');
    expect(button?.getAttribute('aria-pressed')).toBe('true');

    button?.click();
    expect(video?.paused).toBe(false);
    expect(button?.textContent?.trim()).toBe('Pausar vídeo');
    expect(button?.getAttribute('aria-pressed')).toBe('false');
  });

  it('shows the play label when autoplay is blocked', async () => {
    document.body.innerHTML = `
      <video data-hero-video data-src="/clip.mp4" aria-hidden="true"></video>
      <button
        type="button"
        data-hero-playback
        data-label-pause="Pausar vídeo"
        data-label-play="Tocar vídeo"
        hidden
        aria-pressed="false"
      >
        Pausar vídeo
      </button>
    `;
    const view = installView({ reduce: false, wide: false, effectiveType: '4g' });
    const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
    if (video) video.play = () => Promise.reject(new Error('blocked'));
    bindSite(document, view);
    await Promise.resolve();
    const button = document.querySelector<HTMLButtonElement>('[data-hero-playback]');
    expect(video?.paused).toBe(true);
    expect(button?.hidden).toBe(false);
    expect(button?.textContent?.trim()).toBe('Tocar vídeo');
    expect(button?.getAttribute('aria-pressed')).toBe('true');
  });

  it('keeps the playback control hidden when the clip is not loaded', () => {
    document.body.innerHTML = `
      <video data-hero-video data-src="/clip.mp4" aria-hidden="true"></video>
      <button type="button" data-hero-playback hidden aria-pressed="false">Pausar vídeo</button>
    `;
    const view = installView({ reduce: true, wide: true });
    bindSite(document, view);
    expect(document.querySelector<HTMLButtonElement>('[data-hero-playback]')?.hidden).toBe(true);
    expect(document.querySelector('[data-hero-video]')?.getAttribute('src')).toBeNull();
  });

  it('computes the pause control as hidden on a phone until the vertical clip plays', () => {
    const style = document.createElement('style');
    style.textContent = readFileSync('src/styles/global.css', 'utf8');
    document.head.append(style);
    const markup = `
      <video
        data-hero-video
        data-src-webm-narrow="/media/hero-narrow.webm"
        data-src-mp4-narrow="/media/hero-narrow.mp4"
        aria-hidden="true"
      ></video>
      <button
        type="button"
        class="hero-playback"
        data-hero-playback
        data-label-pause="Pausar vídeo"
        data-label-play="Tocar vídeo"
        hidden
        aria-pressed="false"
      >
        Pausar vídeo
      </button>
    `;

    document.body.innerHTML = markup;
    const parked = document.querySelector<HTMLButtonElement>('[data-hero-playback]');
    expect(getComputedStyle(parked!).display).toBe('none');

    for (const flags of [
      { reduce: true, wide: false },
      { reduce: false, wide: false, saveData: true },
      { reduce: false, wide: false, effectiveType: '3g' },
    ] as const) {
      document.body.innerHTML = markup;
      bindSite(document, installView(flags));
      const held = document.querySelector<HTMLButtonElement>('[data-hero-playback]');
      expect(held?.hidden, JSON.stringify(flags)).toBe(true);
      expect(getComputedStyle(held!).display, JSON.stringify(flags)).toBe('none');
      expect(document.querySelector('[data-hero-video] source')).toBeNull();
    }

    document.body.innerHTML = markup;
    bindSite(document, installView({ reduce: false, wide: false, effectiveType: '4g' }));
    const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
    const button = document.querySelector<HTMLButtonElement>('[data-hero-playback]');
    expect(
      [...(video?.querySelectorAll('source') ?? [])].map((node) => node.getAttribute('src')),
    ).toEqual(['/media/hero-narrow.webm', '/media/hero-narrow.mp4']);
    expect(button?.hidden).toBe(false);
    expect(getComputedStyle(button!).display).not.toBe('none');
    button?.click();
    expect(video?.paused).toBe(true);
    expect(button?.textContent?.trim()).toBe('Tocar vídeo');
    style.remove();
  });

  it('attaches both formats and uses the hero photograph as the poster', () => {
    document.body.innerHTML = `
      <img class="hero-still" src="/assets/hero.jpg" />
      <video data-hero-video data-src-webm="/media/hero.webm" data-src-mp4="/media/hero.mp4"></video>
    `;
    const still = document.querySelector<HTMLImageElement>('.hero-still');
    Object.defineProperty(still, 'currentSrc', {
      configurable: true,
      value: '/assets/hero.jpg',
    });
    const view = installView({ reduce: false, wide: true, effectiveType: '4g' });
    bindSite(document, view);
    const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
    expect(
      [...(video?.querySelectorAll('source') ?? [])].map((node) => node.getAttribute('src')),
    ).toEqual(['/media/hero.webm', '/media/hero.mp4']);
    expect(video?.getAttribute('src')).toBeNull();
    expect(video?.poster ?? '').toContain('/assets/hero.jpg');
    expect(video?.muted).toBe(true);
  });
});
