import { useLenis } from 'lenis/react';
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * Snaps scroll to each `[data-snap-section]` element inside `containerRef`.
 * Only snaps when the section covers more than 50% of the viewport and the
 * user has stopped scrolling, so sections below snap zones are freely reachable.
 *
 * No "snapping" flag — the animation's own velocity (> 0.1) prevents re-triggers
 * during the snap, and the top-position check prevents looping once arrived.
 */
export function useSectionSnap(containerRef: RefObject<HTMLElement | null>) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLenis((lenis) => {
    const container = containerRef.current;
    if (!container || !window.matchMedia('(min-width: 1024px)').matches) return;

    // Actively scrolling or snapping: cancel pending check
    if (Math.abs(lenis.velocity) > 0.1) {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // A check is already scheduled
    if (timerRef.current !== null) return;

    timerRef.current = setTimeout(() => {
      timerRef.current = null;

      const sections = Array.from(container.querySelectorAll<HTMLElement>('[data-snap-section]'));
      let best: HTMLElement | null = null;
      let bestRatio = 0;

      for (const section of sections) {
        const r = section.getBoundingClientRect();
        const visible = Math.max(Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0), 0);
        const ratio = visible / window.innerHeight;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          best = section;
        }
      }

      if (!best || bestRatio < 0.5) return;
      // Already at target — prevents infinite loop after snap completes
      if (Math.abs(best.getBoundingClientRect().top) < 2) return;

      lenis.scrollTo(best);
    }, 80);
  });

  useEffect(
    () => () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    },
    []
  );
}
