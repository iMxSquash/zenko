import { ZenkoLogo } from '@/components/ui/ZenkoLogo';
import { useAuth } from '@/lib/supabase/use-auth';
import { Link } from '@tanstack/react-router';

export function LandingNav() {
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-surface px-8 py-3 md:px-16">
      <ZenkoLogo width={120} />
      <div className="flex items-center gap-8">
        {user ? (
          <Link
            to="/bibliotheque"
            className="rounded-full bg-brand px-5 py-2.5 font-display text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Bibliothèque
          </Link>
        ) : (
          <Link
            to="/login"
            className="rounded-full bg-brand px-5 py-2.5 font-display text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Se connecter
          </Link>
        )}
      </div>
    </nav>
  );
}
