import { HERO_DECOR, SectionDecor } from '@/components/landing/LandingDecor';
import { RoleCard } from '@/components/landing/RoleCard';
import { Link } from '@tanstack/react-router';

// Avatars are local SVG files in public/assets/ (served from the site root, so
// referenced as '/assets/...'). Map each Ellipse file to the right person by
// opening them in a browser — they are named generically by the Figma export.
const ROLES = [
  {
    label: 'ENSEIGNANTE',
    name: 'Marie, prof CM1',
    bg: '#e2f2fb',
    color: '#176a99',
    avatar: '/assets/Ellipse-3.svg',
  },
  {
    label: 'PARENT',
    name: 'Karim, papa de Léo',
    bg: '#fceaf0',
    color: '#d77890',
    avatar: '/assets/Ellipse-2.svg',
  },
  {
    label: 'PÉDOPSY',
    name: 'Dr. Lambert',
    bg: '#e1f4e5',
    color: '#288d40',
    avatar: '/assets/Ellipse-1.svg',
  },
  {
    label: 'SPÉCIALISTE',
    name: 'Sophie, orthophoniste',
    bg: '#fce2d2',
    color: '#a03f0e',
    avatar: '/assets/Ellipse.svg',
  },
] as const;

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-background px-8 py-16 md:px-16">
      {/* Decorative shapes — see LandingDecor.tsx (expiring URLs note there) */}
      <SectionDecor shapes={HERO_DECOR} />

      <div className="relative z-10 flex flex-col gap-12 lg:flex-row lg:items-center">
        {/* Left — text + CTAs */}
        <div className="flex max-w-165 flex-col gap-8">
          {/* Badge */}
          <div className="flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5">
            <img
              src="/assets/Ellipse-4.svg"
              alt=""
              aria-hidden="true"
              className="size-2 shrink-0"
            />
            <span className="whitespace-nowrap text-label font-semibold text-text-secondary">
              Pour les enseignants, parents et spécialistes
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-[52px] font-bold leading-[1.1] tracking-display text-dark md:text-display-xl md:leading-20">
            Même enfant.
            <br />
            Mêmes m
            {/*
              Matches the Figma structure (node 281:309): the literal "o" is
              transparent and holds the layout slot, while the hand-drawn
              scribble is absolutely positioned over that slot. This is the
              responsive-safe equivalent of the design's frame-relative inset —
              the overlay tracks the letter regardless of where the line wraps.
            */}
            <span className="relative inline-block select-none">
              <span className="text-transparent">o</span>
              <img
                src="/assets/Group_1.svg"
                alt="o"
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[64%] -translate-x-1/2 -translate-y-1/2 max-w-none"
                style={{ width: '0.62em', height: '0.66em' }}
              />
            </span>
            ts.
          </h1>

          {/* Subtitle */}
          <p className="max-w-140 text-body-lg leading-7 text-text-muted">
            ZENKO réunit l'école, la famille et les spécialistes dans un espace partagé. Pour que
            les signaux flous deviennent enfin des conversations utiles autour de l'enfant.
          </p>

          {/* CTA + trust signals */}
          <div className="flex flex-col gap-4">
            <Link
              to="/login"
              search={{ mode: 'signup' }}
              className="w-fit rounded-full bg-brand-100 px-6 py-4 font-display text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Créer mon compte gratuitement
            </Link>
            <div className="flex flex-wrap gap-6 text-[13px] font-medium text-text-muted">
              <span>✓ RGPD conforme</span>
              <span>✓ Gratuit pour les enseignants</span>
              <span>✓ Sans engagement</span>
            </div>
          </div>
        </div>

        {/* Right — role cards grid */}
        <div className="relative z-20 ml-auto shrink-0 lg:w-130">
          <div className="relative grid grid-cols-2 gap-4">
            {ROLES.map((role) => (
              <RoleCard key={role.label} {...role} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
