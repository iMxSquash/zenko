import { ZenkoLogo } from '@/components/ui/ZenkoLogo';
import { useIsAdmin } from '@/hooks/useAdmin';
import { useInProgressFiches, useSavedFiches } from '@/hooks/useBibliotheque';
import { useProfile } from '@/hooks/useProfile';
import { signOut } from '@/lib/supabase/auth';
import { useAuth } from '@/lib/supabase/use-auth';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui';
import {
  BookOpen,
  ChatCircle,
  List,
  Microphone,
  type Icon as PhosphorIcon,
  Shield,
  SignIn,
  SignOut,
  X,
} from '@phosphor-icons/react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';

function getInitials(name: string) {
  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      width="13"
      height="22"
      viewBox="0 0 13 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.487951 9.42838L9.91628 4.3663e-05L12.273 2.35671L4.02295 10.6067L12.2729 18.8567L9.91628 21.2134L0.487951 11.785C0.175499 11.4725 -2.67679e-05 11.0487 -2.67293e-05 10.6067C-2.66907e-05 10.1648 0.175499 9.74092 0.487951 9.42838Z"
        fill="currentColor"
      />
    </svg>
  );
}

const navLinkBase =
  'flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-body-sm transition-colors';
const activeClass = 'bg-teacher-bg font-semibold text-teacher';
const inactiveClass = 'font-medium text-text-active hover:bg-neutral-100';

const iconLinkBase =
  'flex size-10 items-center justify-center rounded-nav transition-colors text-text-muted';
const iconActiveClass = 'bg-teacher-bg text-teacher';
const iconInactiveClass = 'hover:bg-neutral-100 hover:text-text-primary';

function IconNavLink({ to, icon: Icon, label }: { to: string; icon: PhosphorIcon; label: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = pathname === to || pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      className={cn(iconLinkBase, isActive ? iconActiveClass : iconInactiveClass)}
    >
      <Icon size={20} weight={isActive ? 'fill' : 'regular'} aria-hidden="true" />
    </Link>
  );
}

export function AppSidebar() {
  const { user } = useAuth();
  const { data: inProgressFiches = [] } = useInProgressFiches(!!user);
  const { data: savedFiches = [] } = useSavedFiches(!!user);
  const { data: profile } = useProfile();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const close = useCallback(() => setMobileOpen(false), []);
  const panelRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusableSelector =
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector));

    getFocusable()[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen, close]);

  const profileName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ');
  const displayName =
    profileName || (user?.user_metadata?.full_name as string | undefined) || user?.email || '';
  const userInitials = getInitials(displayName);

  async function handleLogout() {
    try {
      close();
      await signOut();
      navigate({ to: '/login' });
    } catch (err) {
      console.error('Logout failed', err);
    }
  }

  const navContent = (
    <nav aria-label="Navigation principale" className="flex flex-1 flex-col gap-6 overflow-y-auto">
      {/* Fiches section */}
      {/* biome-ignore lint/a11y/useSemanticElements: role="group" has no HTML equivalent in nav context */}
      <div role="group" aria-labelledby="nav-section-fiches" className="flex flex-col gap-1">
        <p
          id="nav-section-fiches"
          className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.88px] text-text-muted"
        >
          Fiches
        </p>

        <Link
          to="/bibliotheque"
          onClick={close}
          className={navLinkBase}
          activeProps={{ className: activeClass }}
          inactiveProps={{ className: inactiveClass }}
        >
          <span className="min-w-0 flex-1">Tableau de bord</span>
        </Link>

        {user && (
          <>
            <Link
              to="/en-cours"
              onClick={close}
              className={navLinkBase}
              activeProps={{ className: activeClass }}
              inactiveProps={{ className: inactiveClass }}
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
              onClick={close}
              className={navLinkBase}
              activeProps={{ className: activeClass }}
              inactiveProps={{ className: inactiveClass }}
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
      {/* biome-ignore lint/a11y/useSemanticElements: role="group" has no HTML equivalent in nav context */}
      <div role="group" aria-labelledby="nav-section-forum" className="flex flex-col gap-1">
        <p
          id="nav-section-forum"
          className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.88px] text-text-muted"
        >
          Forum
        </p>

        <Link
          to="/forum"
          onClick={close}
          className={navLinkBase}
          activeProps={{ className: activeClass }}
          inactiveProps={{ className: inactiveClass }}
        >
          <span className="min-w-0 flex-1">Explorer</span>
        </Link>
      </div>

      {/* Assistant section */}
      {user && (
        // biome-ignore lint/a11y/useSemanticElements: role="group" has no HTML equivalent in nav context
        <div role="group" aria-labelledby="nav-section-assistant" className="flex flex-col gap-1">
          <p
            id="nav-section-assistant"
            className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.88px] text-text-muted"
          >
            Assistant
          </p>

          <Link
            to="/assistant"
            onClick={close}
            className={navLinkBase}
            activeProps={{ className: activeClass }}
            inactiveProps={{ className: inactiveClass }}
          >
            <span className="min-w-0 flex-1">Assistant vocal</span>
          </Link>
        </div>
      )}

      {/* Administration section */}
      {isAdmin && (
        // biome-ignore lint/a11y/useSemanticElements: role="group" has no HTML equivalent in nav context
        <div role="group" aria-labelledby="nav-section-admin" className="flex flex-col gap-1">
          <p
            id="nav-section-admin"
            className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.88px] text-text-muted"
          >
            Administration
          </p>

          <Link
            to="/admin"
            onClick={close}
            className={navLinkBase}
            activeProps={{ className: activeClass }}
            inactiveProps={{ className: inactiveClass }}
          >
            <span className="min-w-0 flex-1">Tableau de bord</span>
          </Link>

          <Link
            to="/admin/fiches"
            onClick={close}
            className={navLinkBase}
            activeProps={{ className: activeClass }}
            inactiveProps={{ className: inactiveClass }}
          >
            <span className="min-w-0 flex-1">Fiches</span>
          </Link>

          <Link
            to="/admin/forum"
            onClick={close}
            className={navLinkBase}
            activeProps={{ className: activeClass }}
            inactiveProps={{ className: inactiveClass }}
          >
            <span className="min-w-0 flex-1">Modération</span>
          </Link>

          <Link
            to="/admin/utilisateurs"
            onClick={close}
            className={navLinkBase}
            activeProps={{ className: activeClass }}
            inactiveProps={{ className: inactiveClass }}
          >
            <span className="min-w-0 flex-1">Utilisateurs</span>
          </Link>

          <Link
            to="/admin/avatars"
            onClick={close}
            className={navLinkBase}
            activeProps={{ className: activeClass }}
            inactiveProps={{ className: inactiveClass }}
          >
            <span className="min-w-0 flex-1">Avatars</span>
          </Link>
        </div>
      )}
    </nav>
  );

  const userSection = user ? (
    <div className="flex items-center gap-1">
      <Link
        to="/profile"
        onClick={close}
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
        className="flex size-11 shrink-0 items-center justify-center rounded-nav text-text-muted transition-colors hover:bg-neutral-100 hover:text-text-primary"
      >
        <SignOut size={18} aria-hidden="true" />
      </button>
    </div>
  ) : (
    <Link
      to="/login"
      onClick={close}
      className="flex w-full items-center justify-center gap-2 rounded-nav bg-brand px-3 py-3 text-body-sm font-semibold text-white transition-opacity hover:opacity-90"
    >
      <SignIn size={18} />
      Se connecter
    </Link>
  );

  return (
    <>
      {/* ── Mobile top nav ── */}
      <nav className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
        <Link to={user ? '/bibliotheque' : '/'} className="block">
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

      {/* ── Mobile full-screen panel — <dialog open> so CSS transitions work (showModal not used, no browser backdrop/focus trap) */}
      <dialog
        ref={panelRef}
        open
        aria-label="Menu de navigation"
        aria-hidden={!mobileOpen}
        className={cn(
          'fixed inset-0 z-50 m-0 flex max-h-none max-w-none flex-col border-0 bg-surface p-0 px-4 py-6 transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-2 pb-6 pt-1">
          <Link to={user ? '/bibliotheque' : '/'} className="block" onClick={close}>
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
        {userSection}
      </dialog>

      {/* ── Desktop collapsed sidebar ── */}
      {sidebarCollapsed ? (
        <aside
          aria-label="Barre latérale"
          className="hidden h-screen w-14.25 shrink-0 flex-col items-center gap-8 border-r border-border bg-surface py-6 lg:flex"
        >
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            aria-label="Déplier la barre latérale"
            className="flex h-10 w-10 items-center justify-center text-text-muted transition-colors hover:text-text-primary"
          >
            <ChevronIcon className="rotate-180" />
          </button>

          <nav
            aria-label="Navigation principale"
            className="flex flex-1 flex-col items-center gap-6"
          >
            <IconNavLink to="/bibliotheque" icon={BookOpen} label="Fiches" />
            <IconNavLink to="/forum" icon={ChatCircle} label="Forum" />
            {user && <IconNavLink to="/assistant" icon={Microphone} label="Assistant vocal" />}
            {isAdmin && <IconNavLink to="/admin" icon={Shield} label="Administration" />}
          </nav>

          {user ? (
            <Link to="/profile" aria-label={`Profil de ${displayName}`}>
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
            </Link>
          ) : (
            <Link
              to="/login"
              aria-label="Se connecter"
              className={cn(iconLinkBase, 'text-brand hover:bg-neutral-100')}
            >
              <SignIn size={20} aria-hidden="true" />
            </Link>
          )}
        </aside>
      ) : (
        /* ── Desktop expanded sidebar ── */
        <aside
          aria-label="Barre latérale"
          className="hidden h-screen w-62 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 lg:flex"
        >
          <div className="flex items-center justify-between px-2 pb-6 pt-1">
            <Link to={user ? '/bibliotheque' : '/'} className="block">
              <ZenkoLogo width={110} />
            </Link>
            <button
              type="button"
              onClick={toggleSidebarCollapsed}
              aria-label="Réduire la barre latérale"
              className="flex h-10 w-10 items-center justify-center text-text-muted transition-colors hover:text-text-primary"
            >
              <ChevronIcon />
            </button>
          </div>
          {navContent}
          {userSection}
        </aside>
      )}
    </>
  );
}
