import { RoleSelector, TextInput } from '@/components/ui';
import { Stepper } from '@/components/ui/Stepper';
import type { ForumUserRole } from '@/types';

const ONBOARDING_STEPS = ['Rôle', 'Profil', 'Premier élève'] as const;

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
  onBack,
  onContinue,
}: OnboardingRoleStepProps) {
  return (
    <section className="flex min-h-[calc(100vh-57px)] flex-col items-center gap-12 bg-background px-8 py-16 md:px-16">
      <Stepper steps={ONBOARDING_STEPS} currentStep={1} />

      {/* Header */}
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-display-md font-bold tracking-display text-text-primary">
          Bienvenue. Vous êtes...
        </h1>
        <p className="max-w-[580px] text-[17px] leading-[26px] text-text-secondary">
          Trois entrées, un seul espace. Choisissez votre profil pour adapter ZENKO à votre
          quotidien.
        </p>
      </div>

      {/* Role cards */}
      <RoleSelector value={selectedRole} onChange={onSelectRole} />

      {/* Champ Doctolib obligatoire pour les experts */}
      {selectedRole === 'expert' && (
        <TextInput
          label="Lien Doctolib"
          placeholder="https://www.doctolib.fr/..."
          value={doctolibUrl}
          onChange={(e) => onDoctolibUrlChange(e.target.value)}
          className="w-full max-w-[400px]"
        />
      )}

      {error && <p className="text-body-sm text-danger">{error}</p>}

      {/* Navigation buttons */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex h-12 items-center gap-2 rounded-full border border-text-secondary px-7 text-[15px] font-semibold text-text-secondary transition-colors hover:bg-neutral-100"
        >
          <span className="inline-block rotate-180">→</span>
          Retour
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!selectedRole || isPending}
          className="flex h-12 items-center gap-2 rounded-full bg-brand px-7 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? 'Enregistrement…' : 'Continuer'}
          <span>→</span>
        </button>
      </div>
    </section>
  );
}
