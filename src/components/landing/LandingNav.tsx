import { ZenkoLogo } from '@/components/ui/ZenkoLogo';
import { Link } from '@tanstack/react-router';

const NAV_LINKS = ['Comment ça marche ?', 'Pour qui ?', 'Ressources', 'Tarifs'] as const;

export function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-surface px-8 py-3 md:px-16">
      <ZenkoLogo width={120} />
      <div className="flex items-center gap-8">
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((label) => (
            <span key={label} className="cursor-default text-sm font-semibold text-text-primary">
              {label}
            </span>
          ))}
        </div>
        <Link
          to="/login"
          className="rounded-full bg-brand px-5 py-2.5 font-display text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Se connecter
        </Link>
      </div>
    </nav>
  );
}
