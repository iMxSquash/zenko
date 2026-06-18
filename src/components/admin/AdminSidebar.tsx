import { ZenkoLogo } from '@/components/ui/ZenkoLogo';
import { signOut } from '@/lib/supabase/auth';
import { cn } from '@/lib/utils';
import { List, SignOut, X } from '@phosphor-icons/react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

const navLinkBase =
  'flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-body-sm transition-colors';
const activeClass = 'bg-teacher-bg font-semibold text-teacher';
const inactiveClass = 'font-medium text-text-active hover:bg-neutral-100';

export function AdminSidebar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = () => setMobileOpen(false);

  async function handleLogout() {
    try {
      await signOut();
      navigate({ to: '/login' });
    } catch (err) {
      console.error('Logout failed', err);
    }
  }

  const navContent = (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
      <div className="flex flex-col gap-1">
        <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.88px] text-text-muted">
          Administration
        </p>

        <Link
          to="/admin"
          onClick={close}
          className={navLinkBase}
          activeOptions={{ exact: true }}
          activeProps={{ className: activeClass }}
          inactiveProps={{ className: inactiveClass }}
        >
          Tableau de bord
        </Link>

        <Link
          to="/admin/fiches"
          onClick={close}
          className={navLinkBase}
          activeProps={{ className: activeClass }}
          inactiveProps={{ className: inactiveClass }}
        >
          Fiches
        </Link>

        <Link
          to="/admin/forum"
          onClick={close}
          className={navLinkBase}
          activeProps={{ className: activeClass }}
          inactiveProps={{ className: inactiveClass }}
        >
          Modération
        </Link>

        <Link
          to="/admin/utilisateurs"
          onClick={close}
          className={navLinkBase}
          activeProps={{ className: activeClass }}
          inactiveProps={{ className: inactiveClass }}
        >
          Utilisateurs
        </Link>

        <Link
          to="/admin/avatars"
          onClick={close}
          className={navLinkBase}
          activeProps={{ className: activeClass }}
          inactiveProps={{ className: inactiveClass }}
        >
          Avatars
        </Link>
      </div>

      <div className="flex flex-col gap-1">
        <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.88px] text-text-muted">
          Application
        </p>

        <Link to="/bibliotheque" onClick={close} className={cn(navLinkBase, inactiveClass)}>
          ← Bibliothèque
        </Link>
      </div>
    </nav>
  );

  const logoutButton = (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full items-center gap-2 rounded-nav px-3 py-3 text-body-sm font-medium text-text-muted transition-colors hover:bg-neutral-100 hover:text-text-primary"
    >
      <SignOut size={16} />
      Déconnexion
    </button>
  );

  return (
    <>
      {/* ── Mobile top nav ── */}
      <nav className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
        <Link to="/admin" className="block">
          <ZenkoLogo width={90} />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Ouvrir le menu"
          className="flex size-10 items-center justify-center rounded-nav text-text-primary transition-colors hover:bg-neutral-100"
        >
          <List size={22} />
        </button>
      </nav>

      {/* ── Mobile backdrop ── */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop is aria-hidden, X button handles keyboard */}
      <div
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={close}
      />

      {/* ── Mobile full-screen panel ── */}
      <aside
        className={cn(
          'fixed inset-0 z-50 flex flex-col bg-surface px-4 py-6 transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-2 pb-6 pt-1">
          <Link to="/admin" className="block" onClick={close}>
            <ZenkoLogo width={110} />
          </Link>
          <button
            type="button"
            onClick={close}
            aria-label="Fermer le menu"
            className="flex size-10 items-center justify-center rounded-nav text-text-muted transition-colors hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>
        {navContent}
        {logoutButton}
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden h-screen w-62 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 lg:flex">
        <Link to="/admin" className="block px-2 pb-6 pt-1">
          <ZenkoLogo width={110} />
        </Link>
        {navContent}
        {logoutButton}
      </aside>
    </>
  );
}
