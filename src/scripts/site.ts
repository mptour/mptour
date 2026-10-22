type View = Window & typeof globalThis;

export function shouldLoadHeroVideo(input: {
  reduce: boolean;
  wide: boolean;
  saveData: boolean;
}): boolean {
  return !input.reduce && input.wide && !input.saveData;
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
  const connection = (view.navigator as Navigator & { connection?: { saveData?: boolean } })
    .connection;
  const video = doc.querySelector<HTMLVideoElement>('[data-hero-video]');

  if (video && shouldLoadHeroVideo({ reduce, wide, saveData: Boolean(connection?.saveData) })) {
    const start = () => {
      const src = video.dataset.src;
      if (!src) return;
      video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
      video.src = src;
      const pending = video.play?.();
      void pending?.catch?.(() => undefined);
    };
    if (typeof view.requestIdleCallback === 'function') {
      view.requestIdleCallback(start, { timeout: 2000 });
    } else {
      view.setTimeout(start, 0);
    }
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
