import { Link } from '@tanstack/react-router';

export function CTABanner() {
  return (
    <section className="flex flex-col items-center justify-center gap-8 bg-brand px-8 py-20 text-center md:px-16">
      <h2 className="text-[40px] font-bold leading-[52px] tracking-display text-white md:text-display-md">
        Prêt à briser l&apos;isolement ?
      </h2>
      <p className="max-w-2xl text-body-lg leading-7 text-white/80">
        Rejoignez les enseignants, parents et spécialistes qui construisent ensemble une école qui
        écoute.
      </p>
      <Link
        to="/login"
        search={{ mode: 'signup' }}
        className="rounded-full bg-white px-6 py-4 font-display text-sm font-semibold text-brand transition-opacity hover:opacity-90"
      >
        Créer mon compte gratuitement
      </Link>
    </section>
  );
}
