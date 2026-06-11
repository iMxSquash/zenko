import { ZenkoLogo } from '@/components/ui/ZenkoLogo';
import { signOut } from '@/lib/supabase/auth';
import { supabase } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';

function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
    staleTime: 1000 * 60 * 5,
  });
}

function getInitials(name: string) {
  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function AppSidebar() {
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();

  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? '';
  const userInitials = getInitials(displayName);

  async function handleLogout() {
    try {
      await signOut();
      navigate({ to: '/login' });
    } catch (err) {
      console.error('Logout failed', err);
    }
  }

  return (
    <aside className="flex h-screen w-[248px] shrink-0 flex-col gap-1 border-r border-border bg-surface px-4 py-6">
      <div className="px-2 pb-6">
        <ZenkoLogo width={110} />
      </div>

      <nav className="flex flex-1 flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.88px] text-text-muted">
            Fiches
          </p>
          <div className="flex flex-col gap-1">
            <Link
              to="/bibliotheque"
              className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors"
              activeProps={{ className: 'bg-vert-25 text-text-primary' }}
              inactiveProps={{ className: 'text-text-muted hover:bg-neutral-50' }}
            >
              Tableau de bord
            </Link>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium text-text-muted transition-colors hover:bg-neutral-50"
            >
              En cours...
              <span className="rounded-full bg-text-muted px-2 py-0.5 text-[10px] font-bold text-white">
                0
              </span>
            </button>
            <button
              type="button"
              className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm font-medium text-text-muted transition-colors hover:bg-neutral-50"
            >
              Fiches enregistrées
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.88px] text-text-muted">
            Forum
          </p>
          <div className="flex flex-col gap-1">
            <Link
              to="/forum"
              className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm font-medium text-text-muted transition-colors hover:bg-neutral-50"
            >
              Populaires
            </Link>
            <Link
              to="/forum"
              className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm font-medium text-text-muted transition-colors hover:bg-neutral-50"
            >
              Explorer
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5 rounded-xl bg-background px-2 py-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-vert-25">
            <span className="text-[13px] font-semibold text-[#288d40]">{userInitials}</span>
          </div>
          <span className="truncate text-[13px] font-semibold text-text-primary">
            {displayName}
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center rounded-xl bg-[#e04e4e] px-2 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#c94242]"
        >
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
