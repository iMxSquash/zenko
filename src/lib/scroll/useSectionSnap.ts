import { useLenis } from 'lenis/react';
import Snap from 'lenis/snap';
import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * Snaps scroll to each `[data-snap-section]` element inside `containerRef`,
 * so the user always lands fully on one section, never between two.
 */
export function useSectionSnap(containerRef: RefObject<HTMLElement | null>) {
  const lenis = useLenis();

  useEffect(() => {
    const container = containerRef.current;
    if (!lenis || !container) return;

    // Desktop-only: snap conflicts with native touch momentum scrolling on mobile/tablet
    if (!window.matchMedia('(min-width: 1024px)').matches) return;

    const snap = new Snap(lenis, { type: 'mandatory' });
    const sections = container.querySelectorAll<HTMLElement>('[data-snap-section]');
    const removeSnaps = Array.from(sections).map((section) =>
      snap.addElement(section, { align: ['start'] })
    );

    return () => {
      for (const remove of removeSnaps) {
        remove();
      }
      snap.destroy();
    };
  }, [lenis, containerRef]);
}
