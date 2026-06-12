import { PROBLEM_DECOR, SectionDecor } from '@/components/landing/LandingDecor';
import { ProblemCard } from '@/components/landing/ProblemCard';
import { SectionLabel } from '@/components/ui/SectionLabel';

const PROBLEMS = [
  {
    title: 'Enseignant démuni',
    text: `Il observe des comportements qu'il ne sait pas lire. Pas d'outils, pas de formation. "Je veux bien faire, mais je ne sais pas comment."`,
    bg: '#fde8ef',
  },
  {
    title: 'Parent ignoré',
    text: "Il a accumulé des années d'expertise sur son enfant. Il arrive informé, il repart en ayant l'impression de n'avoir pas été entendu.",
    bg: '#c7f2dc',
  },
  {
    title: 'Spécialiste isolé',
    text: 'Ses recommandations restent dans les comptes-rendus. Aucun canal pour que ses conseils deviennent des actions concrètes en classe.',
    bg: '#cfe7f5',
  },
] as const;

export function ProblemSection() {
  return (
    <section className="relative overflow-hidden bg-surface px-8 py-20 md:px-16">
      <SectionDecor shapes={PROBLEM_DECOR} />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <SectionLabel color="var(--color-brand-orange)">LE PROBLÈME</SectionLabel>
        <h2 className="max-w-5xl text-center text-[40px] font-bold leading-13 tracking-display text-dark md:text-display-md">
          {' '}
          Chacun parle de l&apos;enfant — personne ne se parle.
        </h2>
        <p className="max-w-4xl text-center text-body-lg leading-7 text-text-secondary">
          563 400 élèves en situation de handicap scolarisés en milieu ordinaire en 2024. Les
          enseignants n&apos;ont pas été formés. Les recommandations des spécialistes ne traversent
          pas les murs de l&apos;école. Les parents arrivent informés et repartent ignorés.
        </p>
        <div className="flex w-full flex-col items-stretch justify-center gap-6 sm:flex-row">
          {PROBLEMS.map((p) => (
            <ProblemCard key={p.title} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}
