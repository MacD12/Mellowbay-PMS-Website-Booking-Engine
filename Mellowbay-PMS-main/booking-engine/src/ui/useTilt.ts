import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';

/**
 * Pointer-tracking tilt for a card.
 *
 * The element is written to directly rather than through React state — a
 * pointermove fires far faster than we would want to re-render, and every
 * property this sets is composite-only, so the browser never relayouts.
 *
 * The element's rect is measured once on enter and reused for the whole hover.
 * Measuring on every move would force a synchronous layout on each frame; the
 * cost of that staleness is only that a card mid-scroll tilts against a rect
 * that has moved, which self-corrects on the next enter.
 *
 * Returns props to spread onto the element. Pair with the `.tilt` class (and
 * `.tilt-glare` for the sheen); the CSS derives rotation, parallax and
 * highlight from the four custom properties written here.
 */
export function useTilt<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  const rect = useRef<DOMRect | null>(null);
  const frame = useRef<number | null>(null);
  const enabled = useRef(false);

  useEffect(() => {
    // A coarse pointer has nothing to track, and a reduced-motion request means
    // the tilt should not happen at all. The CSS also guards both, so this is
    // about not doing the work rather than about correctness.
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');

    const sync = () => {
      enabled.current = fine.matches && !still.matches;
    };

    sync();
    fine.addEventListener('change', sync);
    still.addEventListener('change', sync);

    return () => {
      fine.removeEventListener('change', sync);
      still.removeEventListener('change', sync);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  const onPointerEnter = useCallback((event: ReactPointerEvent<T>) => {
    const el = ref.current;
    if (!el || !enabled.current) return;
    rect.current = el.getBoundingClientRect();
    el.dataset.tilting = 'true';
    // Seed the sheen at the entry point so it does not sweep in from centre.
    const r = rect.current;
    el.style.setProperty('--mx', `${((event.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty('--my', `${((event.clientY - r.top) / r.height) * 100}%`);
  }, []);

  const onPointerMove = useCallback((event: ReactPointerEvent<T>) => {
    const el = ref.current;
    const r = rect.current;
    if (!el || !r || !enabled.current) return;

    const px = (event.clientX - r.left) / r.width;
    const py = (event.clientY - r.top) / r.height;

    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      // Clamped so a pointer that leaves via a fast flick cannot overshoot.
      el.style.setProperty('--tx-n', String(Math.max(-1, Math.min(1, (px - 0.5) * 2))));
      el.style.setProperty('--ty-n', String(Math.max(-1, Math.min(1, (py - 0.5) * 2))));
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
    });
  }, []);

  const onPointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    rect.current = null;
    delete el.dataset.tilting;
    // Back to neutral — the slow transition on .tilt does the settling.
    el.style.setProperty('--tx-n', '0');
    el.style.setProperty('--ty-n', '0');
  }, []);

  return { ref, onPointerEnter, onPointerMove, onPointerLeave };
}
