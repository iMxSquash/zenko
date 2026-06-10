import { TestimonialCard } from '@/components/landing/TestimonialCard';
import { SectionLabel } from '@/components/ui/SectionLabel';

const TESTIMONIALS = [
  {
    quote:
      "Sans temps d'échange structuré avec les parents, je me sens souvent démunie face aux comportements atypiques.",
    bg: '#cfe7f5',
    color: '#2f9dd4',
  },
  {
    quote:
      'Quand je peux expliquer ce qui apaise ou déclenche mon enfant, ça évite beaucoup de malentendus en classe.',
    bg: '#fde8ef',
    color: '#d77890',
  },
  {
    quote:
      "La rencontre crée un langage commun autour des besoins de l'enfant. Sans ça, chacun agit dans son coin.",
    bg: '#c7f2dc',
    color: '#288d40',
  },
] as const;

export function TestimonialsSection() {
  return (
    <section className="overflow-hidden bg-surface px-8 py-20 md:px-16">
      <div className="flex flex-col items-center gap-8">
        <SectionLabel color="#52c46a">ILS NOUS PARLENT</SectionLabel>
        <h2 className="text-center text-[40px] font-bold leading-[52px] tracking-display text-dark md:text-display-md">
          Les mots des gens du terrain.
        </h2>
        <div className="grid w-full gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.color} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}
