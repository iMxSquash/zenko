import { ZenkoLogo } from '@/components/ui/ZenkoLogo';
import { Link } from '@tanstack/react-router';

export function OnboardingNav() {
  return (
    <nav className="flex items-center justify-between border-b border-border bg-surface px-8 py-3 md:px-16">
      <ZenkoLogo width={120} />
      <div className="flex items-center gap-6">
        <span className="text-sm font-semibold text-text-secondary">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-text-primary hover:underline">
            Connectez-vous.
          </Link>
        </span>
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
