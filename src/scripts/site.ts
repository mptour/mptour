const header = document.querySelector<HTMLElement>('[data-header]');
const nav = document.querySelector<HTMLElement>('[data-nav]');
const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');

function setMenu(open: boolean) {
  nav?.toggleAttribute('data-open', open);
  header?.toggleAttribute('data-open', open);
  toggle?.setAttribute('aria-expanded', String(open));
  document.body.toggleAttribute('data-lock', open);
}

function setScrolled() {
  const solid = window.scrollY > 24;
  header?.toggleAttribute('data-solid', solid);
}

toggle?.addEventListener('click', () => {
  setMenu(!nav?.hasAttribute('data-open'));
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav?.hasAttribute('data-open')) {
    setMenu(false);
    toggle?.focus();
  }
});

setScrolled();
document.addEventListener('scroll', setScrolled, { passive: true });

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wide = window.matchMedia('(min-width: 1100px)').matches;
const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;

const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
if (video && !reduce && wide && !connection?.saveData) {
  const start = () => {
    const src = video.dataset.src;
    if (!src) return;
    video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
    video.src = src;
    void video.play().catch(() => undefined);
  };
  window.requestIdleCallback(start, { timeout: 2000 });
}

if (!reduce) {
  const reveal = document.querySelectorAll('[data-reveal]');
  const observer = new IntersectionObserver(
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
