type View = Window & typeof globalThis;

type NetInfo = { saveData?: boolean; effectiveType?: string };

const SLOW_CONNECTIONS = new Set(['slow-2g', '2g', '3g']);

/** Phones and portrait tablets. Landscape tablets stay on the 16:9 file. */
export const HERO_NARROW_MEDIA = '(max-width: 839px)';

export function isSlowConnection(effectiveType: string | undefined): boolean {
  return typeof effectiveType === 'string' && SLOW_CONNECTIONS.has(effectiveType);
}

export function shouldLoadHeroVideo(input: {
  reduce: boolean;
  wide?: boolean;
  saveData: boolean;
  slow?: boolean;
}): boolean {
  return !input.reduce && !input.saveData && !input.slow;
}

export function pickHeroSources(input: {
  wide: boolean;
  dataset: {
    srcWebm?: string;
    srcMp4?: string;
    srcWebmNarrow?: string;
    srcMp4Narrow?: string;
    src?: string;
  };
}): { webm?: string; mp4?: string; single?: string } {
  const webm = input.wide
    ? input.dataset.srcWebm
    : (input.dataset.srcWebmNarrow ?? input.dataset.srcWebm);
  const mp4 = input.wide
    ? input.dataset.srcMp4
    : (input.dataset.srcMp4Narrow ?? input.dataset.srcMp4);
  if (webm || mp4) return { webm, mp4 };
  return { single: input.dataset.src };
}

function videoSource(doc: Document, src: string, type: string): HTMLSourceElement {
  const node = doc.createElement('source');
  node.src = src;
  node.type = type;
  return node;
}

function reflectPlayback(video: HTMLVideoElement, button: HTMLButtonElement): void {
  const paused = video.paused;
  button.hidden = false;
  button.textContent = paused
    ? (button.dataset.labelPlay ?? 'Tocar vídeo')
    : (button.dataset.labelPause ?? 'Pausar vídeo');
  button.setAttribute('aria-pressed', paused ? 'true' : 'false');
}

function bindPlayback(video: HTMLVideoElement, button: HTMLButtonElement | null): void {
  if (!button || button.dataset.bound === 'true') return;
  button.dataset.bound = 'true';
  const reflect = () => reflectPlayback(video, button);
  button.addEventListener('click', () => {
    if (video.paused) {
      const pending = video.play?.();
      void pending?.catch?.(() => reflect());
      return;
    }
    video.pause();
  });
  video.addEventListener('play', reflect);
  video.addEventListener('pause', reflect);
  reflect();
}

export function bindSite(doc: Document, view: View): void {
  const header = doc.querySelector<HTMLElement>('[data-header]');
  const nav = doc.querySelector<HTMLElement>('[data-nav]');
  const toggle = doc.querySelector<HTMLButtonElement>('[data-nav-toggle]');

  function setMenu(open: boolean) {
    nav?.toggleAttribute('data-open', open);
    header?.toggleAttribute('data-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
    doc.body.toggleAttribute('data-lock', open);
  }

  function setScrolled() {
    const solid = view.scrollY > 24;
    header?.toggleAttribute('data-solid', solid);
  }

  toggle?.addEventListener('click', () => {
    setMenu(!nav?.hasAttribute('data-open'));
  });

  nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  doc.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav?.hasAttribute('data-open')) {
      setMenu(false);
      toggle?.focus();
    }
  });

  setScrolled();
  view.addEventListener('scroll', setScrolled, { passive: true });

  const reduce = view.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wide = !view.matchMedia(HERO_NARROW_MEDIA).matches;
  const connection = (view.navigator as Navigator & { connection?: NetInfo }).connection;
  const video = doc.querySelector<HTMLVideoElement>('[data-hero-video]');

  if (
    video &&
    shouldLoadHeroVideo({
      reduce,
      wide,
      saveData: Boolean(connection?.saveData),
      slow: isSlowConnection(connection?.effectiveType),
    })
  ) {
    const start = () => {
      const picked = pickHeroSources({ wide, dataset: video.dataset });
      const webm = picked.webm;
      const mp4 = picked.mp4;
      const single = picked.single;
      if (!webm && !mp4 && !single) return;

      const still = doc.querySelector<HTMLImageElement>('.hero-still');
      const poster = still?.currentSrc || still?.getAttribute('src');
      if (poster) video.poster = poster;

      video.muted = true;
      video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
      bindPlayback(video, doc.querySelector<HTMLButtonElement>('[data-hero-playback]'));

      if (webm || mp4) {
        if (webm) video.append(videoSource(doc, webm, 'video/webm'));
        if (mp4) video.append(videoSource(doc, mp4, 'video/mp4'));
        video.load?.();
      } else if (single) {
        video.src = single;
      }

      const pending = video.play?.();
      void pending?.catch?.(() => {
        const button = doc.querySelector<HTMLButtonElement>('[data-hero-playback]');
        if (button) reflectPlayback(video, button);
      });
    };
    const idle = () => {
      if (typeof view.requestIdleCallback === 'function') {
        view.requestIdleCallback(start, { timeout: 2000 });
      } else {
        view.setTimeout(start, 0);
      }
    };
    if (doc.readyState === 'complete') idle();
    else view.addEventListener('load', idle, { once: true });
  }

  if (!reduce) {
    const reveal = doc.querySelectorAll('[data-reveal]');
    const observer = new view.IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
    );
    reveal.forEach((node) => observer.observe(node));
  }
}
