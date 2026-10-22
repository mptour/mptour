// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindSite, isSlowConnection, shouldLoadHeroVideo } from '../src/scripts/site';

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
        : query === '(min-width: 1100px)'
          ? flags.wide
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
  it('loads only on a wide screen that is not saving data, reducing motion, or slow', () => {
    expect(shouldLoadHeroVideo({ reduce: false, wide: true, saveData: false })).toBe(true);
    expect(shouldLoadHeroVideo({ reduce: true, wide: true, saveData: false })).toBe(false);
    expect(shouldLoadHeroVideo({ reduce: false, wide: false, saveData: false })).toBe(false);
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

  it('assigns the hero clip only when the screen is wide and idle', () => {
    document.body.innerHTML = fixture;
    const view = installView({ reduce: false, wide: true });
    bindSite(document, view);
    const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
    expect(video?.getAttribute('src') ?? video?.src ?? '').toContain('clip.mp4');
  });

  it('leaves the hero clip unloaded on a narrow or data-saver screen', () => {
    document.body.innerHTML = fixture;
    const narrow = installView({ reduce: false, wide: false });
    bindSite(document, narrow);
    expect(document.querySelector('[data-hero-video]')?.getAttribute('src')).toBeNull();

    document.body.innerHTML = fixture;
    const saver = installView({ reduce: false, wide: true, saveData: true });
    bindSite(document, saver);
    expect(document.querySelector('[data-hero-video]')?.getAttribute('src')).toBeNull();
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
