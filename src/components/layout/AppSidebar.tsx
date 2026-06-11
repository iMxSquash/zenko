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

const NAV_ITEMS = [
  { icon: '◉', label: 'Tableau de bord', to: '/app' as const },
  { icon: '♥', label: 'Mes élèves', to: null, badge: 3 },
  { icon: '✉', label: 'Conversations', to: null, badge: 5 },
  { icon: '✦', label: 'Ressources', to: '/bibliotheque' as const },
  { icon: '★', label: 'Spécialistes', to: null },
] as const;

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
    <aside className="flex h-screen w-[248px] shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
      <div className="px-2 pb-6 pt-1">
        <ZenkoLogo width={110} />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.88px] text-text-muted">
          Menu
        </p>

        {NAV_ITEMS.map((item) =>
          item.to ? (
            <Link
              key={item.label}
              to={item.to}
              className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-[14px] transition-colors"
              activeProps={{ className: 'bg-teacher-bg font-semibold text-teacher' }}
              inactiveProps={{ className: 'font-medium text-text-active hover:bg-neutral-100' }}
            >
              <span className="shrink-0 font-bold">{item.icon}</span>
              <span className="min-w-0 flex-1">{item.label}</span>
            </Link>
          ) : (
            <button
              key={item.label}
              type="button"
              className="flex w-full items-center gap-3 overflow-hidden rounded-nav px-3 py-3 text-[14px] font-medium text-text-active transition-colors hover:bg-neutral-100"
            >
              <span className="shrink-0 font-bold text-text-secondary">{item.icon}</span>
              <span className="min-w-0 flex-1 text-left">{item.label}</span>
              {'badge' in item && item.badge != null && (
                <span className="shrink-0 rounded-full bg-brand-orange px-2 py-0.5 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </button>
          )
        )}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-2.5 rounded-nav bg-background px-2 py-2.5 transition-colors hover:bg-neutral-100"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e1f4e5]">
          <span className="text-[13px] font-semibold text-[#288d40]">{userInitials}</span>
        </div>
        <span className="min-w-0 flex-1 truncate text-left text-[13px] font-semibold text-text-primary">
          {displayName}
        </span>
      </button>
    </aside>
  );
}
