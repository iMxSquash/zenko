import { ZenkoLogo } from '@/components/ui/ZenkoLogo';
import { useInProgressFiches, useSavedFiches } from '@/hooks/useBibliotheque';
import { useProfile } from '@/hooks/useProfile';
import { signOut } from '@/lib/supabase/auth';
import { supabase } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';

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
  const { data: inProgressFiches = [] } = useInProgressFiches();
  const { data: savedFiches = [] } = useSavedFiches();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  const profileName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ');
  const displayName =
    profileName || (user?.user_metadata?.full_name as string | undefined) || user?.email || '';
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
    <aside className="flex h-screen w-[248px] shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
      <div className="px-2 pb-6 pt-1">
        <ZenkoLogo width={110} />
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {/* Fiches section */}
        <div className="flex flex-col gap-1">
          <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.88px] text-text-muted">
            Fiches
          </p>

          <Link
            to="/app"
            className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-[14px] transition-colors"
            activeProps={{ className: 'bg-teacher-bg font-semibold text-teacher' }}
            inactiveProps={{ className: 'font-medium text-text-active hover:bg-neutral-100' }}
          >
            <span className="min-w-0 flex-1">Tableau de bord</span>
          </Link>

          <Link
            to="/en-cours"
            className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-[14px] transition-colors"
            activeProps={{ className: 'bg-teacher-bg font-semibold text-teacher' }}
            inactiveProps={{ className: 'font-medium text-text-active hover:bg-neutral-100' }}
          >
            <span className="min-w-0 flex-1">En cours…</span>
            {inProgressFiches.length > 0 && (
              <span className="shrink-0 rounded-full bg-text-muted px-2 py-0.5 text-[10px] font-bold text-white">
                {inProgressFiches.length}
              </span>
            )}
          </Link>

          <Link
            to="/favoris"
            className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-[14px] transition-colors"
            activeProps={{ className: 'bg-teacher-bg font-semibold text-teacher' }}
            inactiveProps={{ className: 'font-medium text-text-active hover:bg-neutral-100' }}
          >
            <span className="min-w-0 flex-1">Favoris</span>
            {savedFiches.length > 0 && (
              <span className="shrink-0 rounded-full bg-text-muted px-2 py-0.5 text-[10px] font-bold text-white">
                {savedFiches.length}
              </span>
            )}
          </Link>

          <Link
            to="/bibliotheque"
            className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-[14px] transition-colors"
            activeProps={{ className: 'bg-teacher-bg font-semibold text-teacher' }}
            inactiveProps={{ className: 'font-medium text-text-active hover:bg-neutral-100' }}
          >
            <span className="min-w-0 flex-1">Ressources</span>
          </Link>
        </div>

        {/* Forum section */}
        <div className="flex flex-col gap-1">
          <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.88px] text-text-muted">
            Forum
          </p>

          <Link
            to="/forum"
            className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-[14px] transition-colors"
            activeProps={{ className: 'bg-teacher-bg font-semibold text-teacher' }}
            inactiveProps={{ className: 'font-medium text-text-active hover:bg-neutral-100' }}
          >
            <span className="min-w-0 flex-1">Populaires</span>
          </Link>

          <Link
            to="/forum"
            className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-[14px] font-medium text-text-active transition-colors hover:bg-neutral-100"
          >
            <span className="min-w-0 flex-1">Explorer</span>
          </Link>
        </div>
      </nav>

      <div className="flex items-center gap-1">
        <Link
          to="/profile"
          className="flex w-full min-w-0 items-center gap-2.5 rounded-nav bg-background px-2 py-2.5 transition-colors hover:bg-neutral-100"
        >
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt=""
              className="size-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e1f4e5]">
              <span className="text-[13px] font-semibold text-[#288d40]">{userInitials}</span>
            </div>
          )}
          <span className="min-w-0 flex-1 truncate text-left text-[13px] font-semibold text-text-primary">
            {displayName}
          </span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Déconnexion"
          className="flex size-9 shrink-0 items-center justify-center rounded-nav text-text-muted transition-colors hover:bg-neutral-100 hover:text-text-primary"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
