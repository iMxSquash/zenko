import { ReactLenis } from 'lenis/react';
import type { ReactNode } from 'react';

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.3, duration: 1, smoothWheel: true }} className="contents">
      {children}
    </ReactLenis>
  );
}
