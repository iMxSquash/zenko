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
    <main className="relative flex min-h-screen flex-col items-stretch overflow-hidden bg-white lg:flex-row">
      {/* Logo absolu en haut a gauche - desktop only */}
      <div className="absolute left-16 top-16 z-20 hidden lg:block">
        <ZenkoLogo width={145} />
      </div>

      {/* Panneau gauche - branding (desktop only) */}
      <div className="relative z-10 hidden flex-col items-center justify-center self-stretch bg-[#fafaf9] lg:flex lg:w-1/2">
        <img
          src="/assets/role_blob.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 select-none"
          style={{ left: -40, bottom: -40, width: '156%', transform: 'translateY(56%)', zIndex: 5 }}
        />

        <div className="relative z-10 flex flex-col gap-2.5" style={{ width: 388 }}>
          <h2
            className="font-bold text-black"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '56px',
              lineHeight: '64px',
              letterSpacing: '-0.84px',
            }}
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
          <p
            className="text-text-secondary"
            style={{ fontSize: 'var(--text-body-sm)', lineHeight: '20px' }}
          >
            Trois entrées, un seul espace.
          </p>
        </div>
      </div>

      {/* Panneau droit - choix du role */}
      <div className="relative flex flex-1 flex-col items-center justify-start overflow-hidden bg-white p-6 lg:justify-center lg:p-3">
        <img
          src="/assets/role_swirl.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute hidden select-none lg:block"
          style={{ right: -14, top: 53, width: 265, height: 116 }}
        />

        {/* Mobile logo - centre en haut */}
        <div className="mb-8 lg:hidden">
          <ZenkoLogo width={120} />
        </div>

        <div className="relative z-10 flex w-full max-w-[442px] flex-col items-center gap-8 lg:items-start">
          {/* Header */}
          <div className="flex w-full flex-col gap-2.5">
            <h1
              className="text-center font-bold text-black lg:hidden"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '28px',
                lineHeight: '36px',
                letterSpacing: '-0.084px',
              }}
            >
              Qui êtes-vous ?
            </h1>
            <h1
              className="hidden font-bold text-black lg:block"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '28px',
                lineHeight: '36px',
                letterSpacing: '-0.084px',
              }}
            >
              Choix du rôle
            </h1>
            <p
              className="text-center text-text-secondary lg:text-left"
              style={{ fontSize: 'var(--text-body-sm)', lineHeight: '20px' }}
            >
              Choisissez votre profil pour adapter ZENKO à votre quotidien.
              <br className="hidden lg:block" />
              Ce choix n&apos;est pas définitif et peut être modifier.
            </p>
          </div>

          {/* Role rows */}
          <div className="flex w-full flex-col gap-3 lg:gap-2.5">
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
                  className="flex w-full items-center justify-between rounded-2xl bg-[#fafaf9] p-2.5 text-left transition-all lg:rounded-[32px] lg:p-8"
                  style={{
                    outline: selected ? `2px solid ${selColor}` : '1px solid transparent',
                    outlineOffset: selected ? '-2px' : '-1px',
                  }}
                >
                  <div className="flex flex-col gap-1 lg:gap-2.5">
                    <p
                      className="text-sm font-bold leading-4 text-black lg:text-[30px] lg:leading-6"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        letterSpacing: '-0.06px',
                      }}
                    >
                      {role.label}
                    </p>
                    <p
                      className={`text-[10px] leading-3 lg:text-[var(--text-body-sm)] lg:leading-5 ${
                        role.id === 'expert' ? 'text-text-secondary' : 'text-text-primary'
                      }`}
                    >
                      {role.description}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors lg:size-[30px]"
                    style={{ borderColor: selected ? selColor : 'var(--color-border-default)' }}
                  >
                    {selected && (
                      <span
                        className="size-1.5 rounded-full lg:size-3.5"
                        style={{ background: selColor }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Doctolib input - affiche uniquement pour Expert */}
          {selectedRole === 'expert' && (
            <div className="flex w-full flex-col gap-2">
              <label
                htmlFor="doctolib-url"
                className="font-bold text-black"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '20px' }}
              >
                Lien Doctolib
              </label>
              <input
                id="doctolib-url"
                type="url"
                value={doctolibUrl}
                onChange={(e) => onDoctolibUrlChange(e.target.value)}
                placeholder="https://www.doctolib.fr/..."
                className="w-full rounded-2xl border border-border-default bg-white px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-[#f7a4c0] focus:ring-2 focus:ring-[#f7a4c0]/30"
              />
            </div>
          )}

          {error && <p className="w-full text-body-sm text-danger">{error}</p>}

          {/* Continuer */}
          <div className="flex w-full flex-col items-stretch lg:items-end">
            <button
              type="button"
              onClick={onContinue}
              disabled={!selectedRole || isPending}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 font-display text-base font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 lg:hidden"
            >
              {isPending ? 'Enregistrement…' : 'Continuer'}
            </button>
            <button
              type="button"
              onClick={onContinue}
              disabled={!selectedRole || isPending}
              className="hidden items-center justify-center gap-2 rounded-full border border-[#a6a39b] px-6 py-4 font-display text-base font-semibold text-text-primary transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 lg:flex"
            >
              {isPending ? 'Enregistrement…' : 'Continuer'}
            </button>
          </div>
        </div>

        {/* Blob cluster - mobile only, en bas */}
        <img
          src="/assets/role_blob.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 w-full select-none lg:hidden"
          style={{ transform: 'translateY(55%)' }}
        />
      </div>
    </main>
  );
}
