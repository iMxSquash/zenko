import { ZenkoLogo } from '@/components/ui/ZenkoLogo';
import { signOut } from '@/lib/supabase/auth';
import { SignOut } from '@phosphor-icons/react';
import { Link, useNavigate } from '@tanstack/react-router';

export function AdminSidebar() {
  const navigate = useNavigate();

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
      <Link to="/admin" className="block px-2 pb-6 pt-1">
        <ZenkoLogo width={110} />
      </Link>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.88px] text-text-muted">
            Administration
          </p>

          <Link
            to="/admin"
            className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-body-sm transition-colors"
            activeOptions={{ exact: true }}
            activeProps={{ className: 'bg-teacher-bg font-semibold text-teacher' }}
            inactiveProps={{ className: 'font-medium text-text-active hover:bg-neutral-100' }}
          >
            Tableau de bord
          </Link>

          <Link
            to="/admin/fiches"
            className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-body-sm transition-colors"
            activeProps={{ className: 'bg-teacher-bg font-semibold text-teacher' }}
            inactiveProps={{ className: 'font-medium text-text-active hover:bg-neutral-100' }}
          >
            Fiches
          </Link>

          <Link
            to="/admin/forum"
            className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-body-sm transition-colors"
            activeProps={{ className: 'bg-teacher-bg font-semibold text-teacher' }}
            inactiveProps={{ className: 'font-medium text-text-active hover:bg-neutral-100' }}
          >
            Modération
          </Link>

          <Link
            to="/admin/utilisateurs"
            className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-body-sm transition-colors"
            activeProps={{ className: 'bg-teacher-bg font-semibold text-teacher' }}
            inactiveProps={{ className: 'font-medium text-text-active hover:bg-neutral-100' }}
          >
            Utilisateurs
          </Link>

          <Link
            to="/admin/avatars"
            className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-body-sm transition-colors"
            activeProps={{ className: 'bg-teacher-bg font-semibold text-teacher' }}
            inactiveProps={{ className: 'font-medium text-text-active hover:bg-neutral-100' }}
          >
            Avatars
          </Link>
        </div>

        <div className="flex flex-col gap-1">
          <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.88px] text-text-muted">
            Application
          </p>

          <Link
            to="/bibliotheque"
            className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-body-sm font-medium text-text-active transition-colors hover:bg-neutral-100"
          >
            ← Bibliothèque
          </Link>
        </div>
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-2 rounded-nav px-3 py-3 text-body-sm font-medium text-text-muted transition-colors hover:bg-neutral-100 hover:text-text-primary"
      >
        <SignOut size={16} />
        Déconnexion
      </button>
    </aside>
  );
}
