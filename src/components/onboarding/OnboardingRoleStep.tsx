import { ZenkoLogo } from '@/components/ui/ZenkoLogo';
import { ROLES } from '@/types';
import type { ForumUserRole } from '@/types';

interface OnboardingRoleStepProps {
  selectedRole: ForumUserRole | null;
  onSelectRole: (role: ForumUserRole) => void;
  doctolibUrl: string;
  onDoctolibUrlChange: (value: string) => void;
  error?: string;
  isPending: boolean;
  onBack: () => void;
  onContinue: () => void;
}

export function OnboardingRoleStep({
  selectedRole,
  onSelectRole,
  doctolibUrl,
  onDoctolibUrlChange,
  error,
  isPending,
  onContinue,
}: OnboardingRoleStepProps) {
  return (
    <main className="relative flex min-h-screen items-stretch overflow-hidden bg-white">
      {/* Logo absolu en haut à gauche — overlay sur tout le layout */}
      <div className="absolute left-16 top-16 z-20">
        <ZenkoLogo width={145} />
      </div>

      {/* Blob cluster bottom-left — image unique (role_blob.png) */}
      <img
        src="/assets/role_blob.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 z-10 hidden w-[640px] select-none lg:block"
      />

      {/* ── Panneau gauche — branding (697/1440 = ~48%) ── */}
      <div className="relative hidden flex-col items-center justify-center self-stretch overflow-hidden bg-neutral-50 lg:flex lg:w-[697px]">
        {/* Texte central */}
        <div className="relative z-10 flex flex-col gap-2.5" style={{ width: 388 }}>
          <h2
            className="font-bold text-black"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '56px', lineHeight: '64px', letterSpacing: '-0.84px' }}
          >
            Bienvenue !
            <br />
            <span className="text-text-primary">Vous</span>
            <span style={{ color: '#2f9dd4' }}> ê</span>
            <span style={{ color: '#f7a4c0' }}>t</span>
            <span style={{ color: '#52c46a' }}>e</span>
            <span style={{ color: '#ffd43b' }}>s</span>
            <span style={{ color: '#ef6a22' }}>...</span>
          </h2>
          <p className="text-text-secondary" style={{ fontSize: 'var(--text-body-sm)', lineHeight: '20px' }}>
            Trois entrées, un seul espace.
          </p>
        </div>
      </div>

      {/* ── Panneau droit — choix du rôle (743/1440 = ~51.6%) ── */}
      <div className="relative flex flex-1 flex-col items-center justify-start overflow-hidden p-3 pt-32">
        {/* Pink swirl (Vector 24) top-right — image (role_swirl.png) */}
        <img
          src="/assets/role_swirl.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute hidden select-none lg:block"
          style={{ right: 40, top: 53, width: 265, height: 116 }}
        />

        {/* Mobile logo */}
        <div className="mb-10 self-start pl-4 lg:hidden">
          <ZenkoLogo width={120} />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Header */}
          <div className="flex w-[442px] max-w-full flex-col gap-2.5">
            <h1
              className="font-bold text-black"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '28px', lineHeight: '36px', letterSpacing: '-0.084px' }}
            >
              Choix du rôle
            </h1>
            <p className="text-text-secondary" style={{ fontSize: 'var(--text-body-sm)', lineHeight: '20px' }}>
              Choisissez votre profil pour adapter ZENKO à votre quotidien.
              <br />
              Ce choix n&apos;est pas définitif et peut être modifier.
            </p>
          </div>

          {/* Role cards */}
          <div className="flex flex-col gap-2.5">
            {ROLES.map((role) => {
              const selected = selectedRole === role.id;
              const selColor =
                role.id === 'parent' ? '#52c46a' : role.id === 'prof' ? '#2f9dd4' : '#f7a4c0';
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => onSelectRole(role.id)}
                  aria-pressed={selected}
                  className="flex w-[506px] max-w-full items-center justify-between rounded-[32px] bg-neutral-50 p-8 text-left transition-all"
                  style={{
                    outline: selected ? `2px solid ${selColor}` : '1px solid transparent',
                    outlineOffset: selected ? '-2px' : '-1px',
                  }}
                >
                  <div className="flex flex-col gap-2.5">
                    <p
                      className="font-bold text-black"
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '28px', lineHeight: '36px', letterSpacing: '-0.084px' }}
                    >
                      {role.label}
                    </p>
                    <p
                      className={role.id === 'expert' ? 'text-text-secondary' : 'text-text-primary'}
                      style={{ fontSize: 'var(--text-body-sm)', lineHeight: '20px' }}
                    >
                      {role.description}
                    </p>
                  </div>
                  {/* Radio dot */}
                  <span
                    aria-hidden="true"
                    className="flex size-[30px] shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                    style={{ borderColor: selected ? selColor : 'var(--color-border-default)' }}
                  >
                    {selected && (
                      <span className="size-3.5 rounded-full" style={{ background: selColor }} />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {error && <p className="w-[506px] max-w-full text-body-sm text-danger">{error}</p>}

          {/* Continuer — pill outline aligné à droite */}
          <div className="flex w-[507px] max-w-full flex-col items-end">
            <button
              type="button"
              onClick={onContinue}
              disabled={!selectedRole || isPending}
              className="flex items-center justify-center gap-2 rounded-full border border-[#a6a39b] px-6 py-4 font-display text-base font-semibold text-text-primary transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending ? 'Enregistrement…' : 'Continuer'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}