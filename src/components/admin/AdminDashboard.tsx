import { useAdminStats } from '@/hooks/useAdmin';

export function AdminDashboard() {
  const { data: stats, isLoading, error } = useAdminStats();

  if (isLoading) return <div className="p-8 text-text-muted">Chargement…</div>;
  if (error) return <div className="p-8 text-danger">Une erreur est survenue.</div>;

  return (
    <div className="p-8">
      <h1 className="mb-8 text-h2 font-bold text-text-primary">Tableau de bord</h1>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Fiches" value={stats?.fichesCount ?? 0} />
        <StatCard label="Threads forum" value={stats?.threadsCount ?? 0} />
        <StatCard label="Utilisateurs" value={stats?.usersCount ?? 0} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 rounded-card bg-surface p-6 shadow-sm">
      <span className="text-[13px] font-semibold uppercase tracking-[0.88px] text-text-muted">
        {label}
      </span>
      <span className="text-[32px] font-bold leading-tight text-text-primary">{value}</span>
    </div>
  );
}
