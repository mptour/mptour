/** Id of a map card addressed by the URL hash, or null when the hash is something else. */
export function cardFromHash(hash: string, ids: readonly string[]): string | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw) return null;
  let id = raw;
  try {
    id = decodeURIComponent(raw);
  } catch {
    return null;
  }
  return ids.includes(id) ? id : null;
}

function isPlainClick(event: MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/**
 * Opens one tour card at a time. Pins stay in the tab order.
 * Escape closes and returns focus to the pin. Arrows only move focus.
 */
export function bindMap(root: HTMLElement): void {
  const doc = root.ownerDocument;
  const view = doc.defaultView;
  if (!view) return;

  const pins = [...root.querySelectorAll<HTMLAnchorElement>('[data-pin]')];
  const cards = [...root.querySelectorAll<HTMLElement>('[data-card]')];
  if (pins.length === 0 || cards.length === 0) return;

  let current: string | null = null;

  function pinFor(image: string) {
    return pins.find((pin) => pin.dataset.pin === image) ?? null;
  }

  function cardFor(image: string) {
    return cards.find((card) => card.dataset.card === image) ?? null;
  }

  function close() {
    const image = current;
    current = null;
    root.removeAttribute('data-open');
    for (const pin of pins) pin.removeAttribute('aria-current');
    for (const card of cards) card.classList.remove('is-open');
    return image;
  }

  function open(image: string, focusCard: boolean) {
    const pin = pinFor(image);
    const card = cardFor(image);
    if (!pin || !card) return;
    for (const other of pins) {
      if (other !== pin) other.removeAttribute('aria-current');
    }
    for (const other of cards) {
      if (other !== card) other.classList.remove('is-open');
    }
    pin.setAttribute('aria-current', 'true');
    card.classList.add('is-open');
    root.setAttribute('data-open', image);
    current = image;
    if (focusCard) card.focus({ preventScroll: true });
  }

  root.addEventListener('click', (event) => {
    if (event.defaultPrevented || !isPlainClick(event)) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const pin = target.closest<HTMLAnchorElement>('[data-pin]');
    if (!pin || !root.contains(pin)) return;
    const image = pin.dataset.pin;
    if (!image) return;
    event.preventDefault();
    if (current === image) {
      close();
      pin.focus({ preventScroll: true });
      return;
    }
    // Pointer clicks leave focus on the pin. Keyboard activation (detail 0) moves into the card.
    open(image, event.detail === 0);
  });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && current) {
      const image = close();
      if (image) pinFor(image)?.focus({ preventScroll: true });
      return;
    }
    const index = pins.findIndex((pin) => pin === doc.activeElement);
    if (index < 0) return;
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    const backward = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    if (!forward && !backward) return;
    event.preventDefault();
    const delta = forward ? 1 : -1;
    pins[(index + delta + pins.length) % pins.length]?.focus({ preventScroll: true });
  });

  const fromHash = cardFromHash(
    view.location.hash,
    cards.map((card) => card.id),
  );
  if (!fromHash) return;
  const image = cards.find((card) => card.id === fromHash)?.dataset.card;
  if (image) open(image, false);
}
