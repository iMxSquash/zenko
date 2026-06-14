import { ZenkoLogo } from '@/components/ui/ZenkoLogo';
import { useIsAdmin } from '@/hooks/useAdmin';
import { useInProgressFiches, useSavedFiches } from '@/hooks/useBibliotheque';
import { useProfile } from '@/hooks/useProfile';
import { signOut } from '@/lib/supabase/auth';
import { useAuth } from '@/lib/supabase/use-auth';
import { Link, useNavigate } from '@tanstack/react-router';
import { LogIn, LogOut } from 'lucide-react';

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
  const { user } = useAuth();
  const { data: inProgressFiches = [] } = useInProgressFiches(!!user);
  const { data: savedFiches = [] } = useSavedFiches(!!user);
  const { data: profile } = useProfile();
  const { data: isAdmin } = useIsAdmin();
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
    <aside className="flex h-screen w-62 shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
      <Link to={user ? '/bibliotheque' : '/'} className="block px-2 pb-6 pt-1">
        <ZenkoLogo width={110} />
      </Link>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {/* Fiches section */}
        <div className="flex flex-col gap-1">
          <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.88px] text-text-muted">
            Fiches
          </p>

          <Link
            to="/bibliotheque"
            className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-body-sm transition-colors"
            activeProps={{ className: 'bg-teacher-bg font-semibold text-teacher' }}
            inactiveProps={{ className: 'font-medium text-text-active hover:bg-neutral-100' }}
          >
            <span className="min-w-0 flex-1">Tableau de bord</span>
          </Link>

          {user && (
            <>
              <Link
                to="/en-cours"
                className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-body-sm transition-colors"
                activeProps={{ className: 'bg-teacher-bg font-semibold text-teacher' }}
                inactiveProps={{ className: 'font-medium text-text-active hover:bg-neutral-100' }}
              >
                <span className="min-w-0 flex-1">En cours…</span>
                {inProgressFiches.length > 0 && (
                  <span className="shrink-0 rounded-full bg-text-muted px-2 py-0.5 text-capsule font-bold text-white">
                    {inProgressFiches.length}
                  </span>
                )}
              </Link>

              <Link
                to="/favoris"
                className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-body-sm transition-colors"
                activeProps={{ className: 'bg-teacher-bg font-semibold text-teacher' }}
                inactiveProps={{ className: 'font-medium text-text-active hover:bg-neutral-100' }}
              >
                <span className="min-w-0 flex-1">Favoris</span>
                {savedFiches.length > 0 && (
                  <span className="shrink-0 rounded-full bg-text-muted px-2 py-0.5 text-capsule font-bold text-white">
                    {savedFiches.length}
                  </span>
                )}
              </Link>
            </>
          )}
        </div>

        {/* Forum section */}
        <div className="flex flex-col gap-1">
          <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.88px] text-text-muted">
            Forum
          </p>

          <Link
            to="/forum"
            className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-body-sm transition-colors"
            activeProps={{ className: 'bg-teacher-bg font-semibold text-teacher' }}
            inactiveProps={{ className: 'font-medium text-text-active hover:bg-neutral-100' }}
          >
            <span className="min-w-0 flex-1">Explorer</span>
          </Link>
        </div>

        {/* Assistant section */}
        {user && (
          <div className="flex flex-col gap-1">
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.88px] text-text-muted">
              Assistant
            </p>

            <Link
              to="/assistant"
              className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-body-sm transition-colors"
              activeProps={{ className: 'bg-teacher-bg font-semibold text-teacher' }}
              inactiveProps={{ className: 'font-medium text-text-active hover:bg-neutral-100' }}
            >
              <span className="min-w-0 flex-1">Assistant vocal</span>
            </Link>
          </div>
        )}

        {/* Administration section */}
        {isAdmin && (
          <div className="flex flex-col gap-1">
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.88px] text-text-muted">
              Administration
            </p>

            <Link
              to="/admin"
              className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-body-sm transition-colors"
              activeProps={{ className: 'bg-teacher-bg font-semibold text-teacher' }}
              inactiveProps={{ className: 'font-medium text-text-active hover:bg-neutral-100' }}
            >
              <span className="min-w-0 flex-1">Tableau de bord</span>
            </Link>

            <Link
              to="/admin/fiches"
              className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-body-sm transition-colors"
              activeProps={{ className: 'bg-teacher-bg font-semibold text-teacher' }}
              inactiveProps={{ className: 'font-medium text-text-active hover:bg-neutral-100' }}
            >
              <span className="min-w-0 flex-1">Fiches</span>
            </Link>

            <Link
              to="/admin/forum"
              className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-body-sm transition-colors"
              activeProps={{ className: 'bg-teacher-bg font-semibold text-teacher' }}
              inactiveProps={{ className: 'font-medium text-text-active hover:bg-neutral-100' }}
            >
              <span className="min-w-0 flex-1">Modération</span>
            </Link>

            <Link
              to="/admin/utilisateurs"
              className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-body-sm transition-colors"
              activeProps={{ className: 'bg-teacher-bg font-semibold text-teacher' }}
              inactiveProps={{ className: 'font-medium text-text-active hover:bg-neutral-100' }}
            >
              <span className="min-w-0 flex-1">Utilisateurs</span>
            </Link>

            <Link
              to="/admin/avatars"
              className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-body-sm transition-colors"
              activeProps={{ className: 'bg-teacher-bg font-semibold text-teacher' }}
              inactiveProps={{ className: 'font-medium text-text-active hover:bg-neutral-100' }}
            >
              <span className="min-w-0 flex-1">Avatars</span>
            </Link>
          </div>
        )}
      </nav>

      {user ? (
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
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pedopsy-bg">
                <span className="text-[13px] font-semibold text-pedopsy">{userInitials}</span>
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
      ) : (
        <Link
          to="/login"
          className="flex w-full items-center justify-center gap-2 rounded-nav bg-brand px-3 py-3 text-body-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <LogIn size={18} />
          Se connecter
        </Link>
      )}
    </aside>
  );
}
