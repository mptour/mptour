type View = Window & typeof globalThis;

type NetInfo = { saveData?: boolean; effectiveType?: string };

const SLOW_CONNECTIONS = new Set(['slow-2g', '2g', '3g']);

export function isSlowConnection(effectiveType: string | undefined): boolean {
  return typeof effectiveType === 'string' && SLOW_CONNECTIONS.has(effectiveType);
}

export function shouldLoadHeroVideo(input: {
  reduce: boolean;
  wide: boolean;
  saveData: boolean;
  slow?: boolean;
}): boolean {
  return !input.reduce && input.wide && !input.saveData && !input.slow;
}

function videoSource(doc: Document, src: string, type: string): HTMLSourceElement {
  const node = doc.createElement('source');
  node.src = src;
  node.type = type;
  return node;
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
  const wide = view.matchMedia('(min-width: 1100px)').matches;
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
      const webm = video.dataset.srcWebm;
      const mp4 = video.dataset.srcMp4;
      const single = video.dataset.src;
      if (!webm && !mp4 && !single) return;

      const still = doc.querySelector<HTMLImageElement>('.hero-still');
      const poster = still?.currentSrc || still?.getAttribute('src');
      if (poster) video.poster = poster;

      video.muted = true;
      video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });

      if (webm || mp4) {
        if (webm) video.append(videoSource(doc, webm, 'video/webm'));
        if (mp4) video.append(videoSource(doc, mp4, 'video/mp4'));
        video.load?.();
      } else if (single) {
        video.src = single;
      }

      const pending = video.play?.();
      void pending?.catch?.(() => undefined);
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
