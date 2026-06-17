import { motion, useScroll, useTransform } from 'motion/react';
import { type RefObject, useEffect, useState } from 'react';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isDesktop;
}

/**
 * Shared decorative shapes for the landing page.
 *
 * ⚠️ Some `src` values point at Figma's asset CDN and EXPIRE ~7 days after they
 * were generated. Before deploying, download each into /public/assets/ and swap
 * the figma.com URLs for local paths (e.g. '/assets/x.svg').
 *
 * Positions are translated from the Figma frames (each section is 1440px wide)
 * and may need small nudges. Each shape renders absolutely-positioned,
 * pointer-events-none, aria-hidden. Accents are desktop-only by default.
 *
 * Set `behind: true` on a shape to push it BEHIND the section content (uses
 * -z-10). Only works in sections whose <section> has the `isolate` class, so
 * the negative z-index stays within the section instead of dropping behind the
 * page background. Shapes without `behind` float ABOVE all section content
 * (below the navbar).
 *
 * `parallax` gives the shape a vertical travel (in px) as its section scrolls
 * through the viewport, for the parallax scroll effect.
 */

export interface DecorShape {
  /** Image path for shapes loaded from /public/assets/. Optional if `svg` or `color` is set. */
  src?: string;
  /** Inline SVG markup (the <path> elements only) for shapes kept in code. */
  svg?: { viewBox: string; children: React.ReactNode };
  /** Solid background color (CSS value) for shapes rendered as a plain colored box. */
  color?: string;
  /** Inline position/size styles applied to the <img>/<svg>/<div>. */
  style: React.CSSProperties;
  /** Overrides `style` on mobile/tablet (< lg). */
  mobileStyle?: React.CSSProperties;
  /** Desktop-only (hidden on small screens). Defaults true for small accents. */
  desktopOnly?: boolean;
  /** Push behind section content (-z-10). Requires `isolate` on the <section>. */
  behind?: boolean;
  /** Vertical parallax travel in px as the section crosses the viewport. */
  parallax?: number;
  /** For debugging / mapping back to Figma. */
  node?: string;
}

// ── Hero (Figma frame 1:244) ───────────────────────────────────────────────
export const HERO_DECOR: DecorShape[] = [
  {
    node: 'Vector 25 (orange blob, inline)',
    behind: true,
    parallax: 100,
    style: { left: -386, top: -398, width: 596, height: 561 },
    svg: {
      viewBox: '-386 -402 596 566',
      children: (
        <path
          d="M-14.3527 -394.849C-34.5098 -402.411 -58.4464 -358.094 -67.8951 -334.99C-75.2441 -353.893 -86.7926 -398 -105.69 -398C-130.886 -398 -140.335 -355.993 -149.784 -331.839C-166.581 -346.542 -200.176 -382.247 -222.223 -375.946C-249.646 -368.109 -237.971 -317.137 -234.822 -287.732C-250.569 -301.385 -287.104 -327.429 -307.261 -322.388C-327.418 -317.347 -311.461 -263.579 -300.962 -237.324C-320.909 -240.475 -362.693 -241.105 -370.252 -218.421C-377.811 -195.738 -350.305 -166.963 -335.607 -155.411C-352.405 -148.06 -386 -127.687 -386 -105.003C-386 -82.3195 -348.205 -59.8459 -329.308 -51.4445C-342.956 -40.9429 -374.238 -22.8661 -367.103 2.11401C-360.881 23.898 -318.806 20.0656 -295.518 17.9444L-294.663 17.8665C-304.112 38.8699 -329.308 77.7261 -310.411 93.4786C-294.663 106.606 -255.818 80.8766 -234.821 68.2746C-237.971 87.1776 -240.49 128.134 -225.373 140.736C-210.255 153.338 -177.079 116.582 -162.382 96.6291C-156.082 116.582 -149.784 159.639 -127.737 162.79C-102.54 166.39 -88.8921 122.883 -77.3437 99.7796C-60.5461 118.683 -37.5605 159.784 -11.2031 156.489C13.993 153.338 17.1428 108.181 23.4419 84.0271C40.2395 99.7796 70.6849 132.86 92.732 121.833C111.629 112.382 103.231 66.1742 99.0311 43.0706C120.028 49.3716 164.542 56.9328 174.62 36.7695C184.699 16.6063 155.723 -19.9395 139.975 -35.692C158.873 -36.7422 202.676 -34.675 209.265 -57.7455C215.564 -79.7991 179.87 -103.953 158.873 -117.605C171.471 -124.956 197.297 -144.699 199.817 -164.863C202.336 -185.026 156.773 -196.368 133.676 -199.518C143.125 -216.321 171.471 -253.077 162.022 -271.98C150.999 -294.033 109.53 -287.732 83.2834 -284.582C86.433 -305.585 99.0309 -350.742 76.9843 -360.194C54.9377 -369.645 25.5416 -339.191 7.69418 -322.388C8.74402 -343.391 5.80444 -387.288 -14.3527 -394.849Z"
          fill="#F05A29"
        />
      ),
    },
  },
  {
    node: 'Vector 23 (blue blob TR)',
    parallax: 130,
    style: { right: -108, top: -161, width: 344, height: 358 },
    svg: {
      viewBox: '0 0 344 358',
      children: (
        <path
          d="M143.549 0.301297C90.9948 5.56168 98.5859 82.7122 106.761 124.794C86.9072 107.26 39.4918 83.7645 8.66019 130.055C-22.1714 176.345 36.689 208.959 69.9731 219.479C54.2069 238.767 27.5796 283.655 47.1997 308.904C66.8199 334.153 116.104 319.425 138.293 308.904C143.549 325.269 165.271 358 210.117 358C254.963 358 256.832 294.877 252.16 263.315C271.43 279.68 315.575 301.189 337.998 256.301C360.421 211.414 314.641 167.461 288.948 151.096C309.386 130.639 343.954 84.1151 318.729 61.6713C293.503 39.2275 232.306 83.8813 204.862 109.014C204.862 82.7124 204.582 -5.80784 143.549 0.301297Z"
          fill="var(--color-info)"
        />
      ),
    },
  },
  {
    node: 'Vector 24 (blue blob BL)',
    parallax: 130,
    style: { left: -199, bottom: -149, width: 344, height: 358 },
    svg: {
      viewBox: '0 0 344 358',
      children: (
        <path
          d="M143.549 0.301297C90.9948 5.56168 98.5859 82.7122 106.761 124.794C86.9072 107.26 39.4918 83.7645 8.66019 130.055C-22.1714 176.345 36.689 208.959 69.9731 219.479C54.2069 238.767 27.5796 283.655 47.1997 308.904C66.8199 334.153 116.104 319.425 138.293 308.904C143.549 325.269 165.271 358 210.117 358C254.963 358 256.832 294.877 252.16 263.315C271.43 279.68 315.575 301.189 337.998 256.301C360.421 211.414 314.641 167.461 288.948 151.096C309.386 130.639 343.954 84.1151 318.729 61.6713C293.503 39.2275 232.306 83.8813 204.862 109.014C204.862 82.7124 204.582 -5.80784 143.549 0.301297Z"
          fill="var(--color-info)"
        />
      ),
    },
  },
  {
    node: 'Vector 22 (accent)',
    behind: true,
    parallax: 300,
    src: '/assets/Vector_22.svg',
    style: { right: 331, top: 400, width: 108, height: 112 },
    desktopOnly: true,
  },
  {
    node: 'Vector 27 (accent)',
    behind: true,
    parallax: 220,
    src: '/assets/Vector_27.svg',
    style: { right: 146, top: 480, width: 87, height: 83 },
    desktopOnly: true,
  },
  {
    node: 'Vector 26 (accent)',
    behind: true,
    parallax: 380,
    src: '/assets/Vector_26.svg',
    style: { left: 720, top: 460, width: 48, height: 50 },
    desktopOnly: true,
  },
];

// ── Problem (Figma frame 1:370) — orange scribbles both corners ─────────────
export const PROBLEM_DECOR: DecorShape[] = [
  {
    node: 'Group 2',
    parallax: 200,
    src: 'https://www.figma.com/api/mcp/asset/27d2b653-31b6-45ff-b118-e6982c511d3a',
    style: { right: -120, top: -90, width: 320, height: 313 },
    desktopOnly: true,
  },
  {
    node: 'Group 1',
    parallax: 200,
    src: 'https://www.figma.com/api/mcp/asset/27d2b653-31b6-45ff-b118-e6982c511d3a',
    style: { left: -130, bottom: -50, width: 320, height: 313, transform: 'scaleX(-1)' },
    desktopOnly: true,
  },
  {
    node: 'Group 3',
    behind: true,
    parallax: 300,
    src: 'https://www.figma.com/api/mcp/asset/1ec3f756-1180-497d-98d3-a1564d178d9c',
    style: { right: 90, bottom: 30, width: 158, height: 158 },
    desktopOnly: true,
  },
  {
    node: 'Group 4',
    behind: true,
    parallax: 300,
    src: 'https://www.figma.com/api/mcp/asset/61219c4d-b94d-448b-8298-dc8c6bb05b64',
    style: { left: 134, top: 100, width: 87, height: 88 },
    desktopOnly: true,
  },
];

// ── Solution (Figma frame 10:147) ──────────────────────────────────────────
export const SOLUTION_DECOR: DecorShape[] = [
  {
    node: 'Vector 20',
    parallax: 100,
    src: 'https://www.figma.com/api/mcp/asset/bef8f92b-f611-4cdc-b1aa-92a2b5558514',
    style: { right: -120, top: -103, width: 429, height: 446 },
    mobileStyle: { right: -110, top: -340, width: 429, height: 446 },
  },
  {
    node: 'Vector 21',
    parallax: 100,
    src: 'https://www.figma.com/api/mcp/asset/3cfd035f-cd62-4a26-aea9-e176db472d7e',
    style: { left: -104, bottom: -120, width: 429, height: 446 },
    mobileStyle: { left: -200, bottom: -220, width: 429, height: 446 },
  },
  {
    node: 'Vector 22',
    behind: true,
    parallax: 250,
    src: 'https://www.figma.com/api/mcp/asset/87df9ce9-a1f7-4297-99f8-53fe74035667',
    style: { left: 180, top: 40, width: 192, height: 200 },
    desktopOnly: true,
  },
  {
    node: 'Vector 23',
    behind: true,
    parallax: 320,
    src: 'https://www.figma.com/api/mcp/asset/35b21305-fb30-4c15-9694-235d3469cec0',
    style: { right: 280, bottom: 60, width: 90, height: 94 },
    desktopOnly: true,
  },
];

// ── Testimonials (Figma frame 10:164) — two large blobs ─────────────────────
export const TESTIMONIALS_DECOR: DecorShape[] = [
  {
    node: 'Vector 21',
    parallax: 100,
    src: 'https://www.figma.com/api/mcp/asset/c970de54-3421-4ac8-ae96-6ba9bddd5ac2',
    style: { left: -310, bottom: -154, width: 596, height: 561 },
    mobileStyle: { left: -280, bottom: -200, width: 596, height: 561 },
  },
  {
    node: 'Vector 22',
    parallax: 100,
    src: 'https://www.figma.com/api/mcp/asset/a565b2c7-82dd-4c70-8682-b2fc147a94f0',
    style: { right: -213, top: -251, width: 596, height: 561 },
    mobileStyle: { right: -300, top: -300, width: 596, height: 561 },
  },
];

/** Shapes without `behind` float above all section content (but below the
 *  sticky navbar, which sits at z-50). */
const FRONT_Z_INDEX = 40;

function ParallaxShape({
  shape: s,
  sectionRef,
  className,
  style,
  isDesktop,
}: {
  shape: DecorShape;
  sectionRef: RefObject<HTMLElement | null>;
  className: string;
  style: React.CSSProperties;
  isDesktop: boolean;
}) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const distance = s.parallax ?? 0;
  // Parallax is desktop-only — motion on mobile causes disorientation and hurts perf
  const y = useTransform(scrollYProgress, [0, 1], isDesktop ? [-distance, distance] : [0, 0]);
  const motionStyle = { ...style, y };

  if (s.color) {
    return (
      <motion.div
        aria-hidden="true"
        className={className}
        style={{ ...motionStyle, backgroundColor: s.color }}
      />
    );
  }
  if (s.svg) {
    return (
      <motion.svg
        viewBox={s.svg.viewBox}
        aria-hidden="true"
        className={className}
        style={motionStyle}
      >
        {s.svg.children}
      </motion.svg>
    );
  }
  return (
    <motion.img src={s.src} alt="" aria-hidden="true" className={className} style={motionStyle} />
  );
}

/** Renders a section's decorative shapes. Place as the first child of a
 *  `relative overflow-hidden` section, before the content wrapper. `sectionRef`
 *  drives the parallax travel as the section scrolls through the viewport. */
export function SectionDecor({
  shapes,
  sectionRef,
}: {
  shapes: DecorShape[];
  sectionRef: RefObject<HTMLElement | null>;
}) {
  const isDesktop = useIsDesktop();

  return (
    <>
      {shapes.map((s, i) => {
        const cls = `pointer-events-none absolute select-none${
          s.desktopOnly ? ' hidden lg:block' : ''
        }`;
        // On mobile/tablet all blobs go behind content to avoid overlapping text
        const zIndex = s.behind || !isDesktop ? -1 : FRONT_Z_INDEX;
        const resolvedStyle = {
          ...(isDesktop ? s.style : (s.mobileStyle ?? s.style)),
          zIndex,
        };
        return (
          <ParallaxShape
            key={s.node ?? i}
            shape={s}
            sectionRef={sectionRef}
            className={cls}
            style={resolvedStyle}
            isDesktop={isDesktop}
          />
        );
      })}
    </>
  );
}
