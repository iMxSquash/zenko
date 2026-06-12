import { SOLUTION_DECOR, SectionDecor } from '@/components/landing/LandingDecor';
import { SolutionCard } from '@/components/landing/SolutionCard';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Link } from '@tanstack/react-router';

const SOLUTIONS = [
  {
    title: 'Une fiche enfant partagée',
    text: "Une seule vue, trois entrées. L'enseignant note ce qu'il observe. Le parent décrit ce qui apaise et déclenche. Le spécialiste traduit ses recommandations en actions concrètes.",
  },
  {
    title: 'Un fil de conversation contextuelle',
    text: "Plus de mails perdus, plus de paperasse. Chaque échange s'attache à un moment, un sujet, une recommandation. L'historique reste visible pour tous, sans charge mentale.",
  },
  {
    title: "Une bibliothèque d'outils prête",
    text: "Fiches pratiques par TND, gabarits d'adaptation pédagogique, scripts de communication. Tout ce qu'un enseignant peut ouvrir entre deux cours et appliquer le lendemain.",
  },
] as const;

export function SolutionSection() {
  return (
    <section className="relative overflow-hidden bg-background px-8 py-20 md:px-16">
      <SectionDecor shapes={SOLUTION_DECOR} />
      <div className="relative z-10 flex flex-col items-center gap-8">
        <SectionLabel color="var(--color-brand-rose)">LA SOLUTION</SectionLabel>
        <h2 className="max-w-5xl text-center text-[40px] font-bold leading-[52px] tracking-display text-dark md:text-display-md">
          Un seul espace.
          <br />
          Trois mondes qui parlent enfin la même langue.
        </h2>
        <div className="flex w-full flex-col items-stretch justify-center gap-6 sm:flex-row">
          {SOLUTIONS.map((s) => (
            <SolutionCard key={s.title} {...s} />
          ))}
        </div>
        <Link
          to="/login"
          search={{ mode: 'signup' }}
          className="rounded-full bg-brand px-6 py-4 font-display text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Créer mon compte gratuitement
        </Link>
      </div>
    </section>
  );
}
