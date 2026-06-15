import { SectionDecor, TESTIMONIALS_DECOR } from '@/components/landing/LandingDecor';
import { TestimonialCard } from '@/components/landing/TestimonialCard';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useRef } from 'react';

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
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      data-snap-section
      className="relative isolate flex flex-col justify-center overflow-hidden bg-surface px-8 py-20 md:px-16"
    >
      <SectionDecor shapes={TESTIMONIALS_DECOR} sectionRef={sectionRef} />
      <div className="relative z-10 flex flex-col items-center gap-8">
        <SectionLabel color="var(--color-success)">ILS NOUS PARLENT</SectionLabel>
        <h2 className="text-center text-[40px] font-bold leading-13 tracking-display text-dark md:text-display-md">
          Les mots des gens du terrain.
        </h2>
        <div className="flex w-full flex-col items-stretch justify-center gap-6 sm:flex-row">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.color} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}
