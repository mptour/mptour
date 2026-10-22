// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindSite, shouldLoadHeroVideo } from '../src/scripts/site';

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
    value: { saveData: Boolean(flags.saveData) },
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
  it('loads only on a wide screen that is not saving data or reducing motion', () => {
    expect(shouldLoadHeroVideo({ reduce: false, wide: true, saveData: false })).toBe(true);
    expect(shouldLoadHeroVideo({ reduce: true, wide: true, saveData: false })).toBe(false);
    expect(shouldLoadHeroVideo({ reduce: false, wide: false, saveData: false })).toBe(false);
    expect(shouldLoadHeroVideo({ reduce: false, wide: true, saveData: true })).toBe(false);
  });
});

describe('bindSite', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
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
});
