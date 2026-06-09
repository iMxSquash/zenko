import { ZenkoLogo } from '@/components/ui/ZenkoLogo';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

const ROLES = [
  { label: 'ENSEIGNANTE', name: 'Marie, prof CM1', bg: '#e2f2fb', color: '#176a99' },
  { label: 'PARENT', name: 'Karim, papa de Léo', bg: '#fceaf0', color: '#d77890' },
  { label: 'PÉDOPSY', name: 'Dr. Lambert', bg: '#e1f4e5', color: '#288d40' },
  { label: 'SPÉCIALISTE', name: 'Sophie, orthophoniste', bg: '#fce2d2', color: '#a03f0e' },
] as const;

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 md:px-16">
        <ZenkoLogo width={120} />
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-neutral-100"
          >
            Se connecter
          </Link>
          <Link
            to="/login"
            search={{ mode: 'signup' }}
            className="rounded-full bg-dark px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Créer un compte
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col gap-8 px-8 pb-16 pt-8 md:px-16">
        {/* Badge */}
        <div className="flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5">
          <div className="size-2 shrink-0 rounded-full bg-[#20CA73]" />
          <span className="whitespace-nowrap text-label font-semibold text-text-secondary">
            Pour les enseignants, parents et spécialistes
          </span>
        </div>

        <div className="flex flex-col items-start gap-12 lg:flex-row lg:justify-between">
          {/* Left — text + CTAs */}
          <div className="flex max-w-[600px] flex-col gap-8">
            <h1 className="text-[56px] font-bold leading-[1.1] tracking-display text-dark md:text-display-xl md:leading-[80px]">
              Même enfant.
              <br />
              Mêmes mots.
            </h1>
            <p className="max-w-[520px] text-body-lg leading-7 text-text-muted">
              ZENKO réunit l'école, la famille et les spécialistes dans un espace partagé. Pour que
              les signaux flous deviennent enfin des conversations utiles autour de l'enfant.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/login"
                search={{ mode: 'signup' }}
                className="rounded-full bg-dark px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Commencer gratuitement
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-neutral-100"
              >
                Se connecter
              </Link>
            </div>
          </div>

          {/* Right — role cards */}
          <div className="relative shrink-0 self-end lg:w-[520px]">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-4 -top-10 size-[140px] rounded-full bg-[#FCD808] lg:size-[180px]" />
            <div className="pointer-events-none absolute -bottom-4 -left-6 size-[100px] rounded-full bg-[#F7A4C0] lg:size-[140px]" />

            {/* 2×2 grid */}
            <div className="relative grid grid-cols-2 gap-4">
              {ROLES.map((role) => (
                <div
                  key={role.label}
                  className="flex h-[140px] flex-col justify-end gap-3 overflow-hidden rounded-card-lg p-6 lg:h-[154px]"
                  style={{ background: role.bg }}
                >
                  <div className="size-14 rounded-full bg-white" />
                  <div className="flex flex-col gap-0.5" style={{ color: role.color }}>
                    <span className="text-[11px] font-semibold tracking-capsule">{role.label}</span>
                    <span className="text-body-lg font-bold">{role.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
