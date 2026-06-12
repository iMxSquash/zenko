import { useAdminUsers } from '@/hooks/useAdmin';
import type { AdminUser } from '@/hooks/useAdmin';

const ROLE_LABELS: Record<string, string> = {
  parent: 'Parent',
  prof: 'Professeur',
  expert: 'Expert',
};

export function AdminUtilisateurs() {
  const { data: users, isLoading, error } = useAdminUsers();

  if (isLoading) return <div className="p-8 text-text-muted">Chargement…</div>;
  if (error) return <div className="p-8 text-danger">Une erreur est survenue.</div>;

  return (
    <div className="p-8">
      <h1 className="mb-6 text-h2 font-bold text-text-primary">Utilisateurs</h1>

      <div className="rounded-card bg-surface shadow-sm overflow-hidden">
        <table className="w-full text-body-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-4 text-left font-semibold text-text-secondary">Nom</th>
              <th className="px-5 py-4 text-left font-semibold text-text-secondary">Email</th>
              <th className="px-5 py-4 text-left font-semibold text-text-secondary">Rôle</th>
              <th className="px-5 py-4 text-left font-semibold text-text-secondary">Inscrit le</th>
              <th className="px-5 py-4 text-left font-semibold text-text-secondary">Admin</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
            {users?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-text-muted">
                  Aucun utilisateur.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserRow({ user }: { user: AdminUser }) {
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email.split('@')[0];

  const date = new Date(user.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <tr className="border-b border-border last:border-0 hover:bg-background transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="size-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-pedopsy-bg">
              <span className="text-[11px] font-semibold text-pedopsy">
                {displayName[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
          )}
          <span className="font-medium text-text-primary">{displayName}</span>
        </div>
      </td>
      <td className="px-5 py-4 text-text-secondary">{user.email}</td>
      <td className="px-5 py-4">
        {user.role ? (
          <span className="rounded-full bg-background px-3 py-1 text-[12px] font-semibold text-text-secondary">
            {ROLE_LABELS[user.role] ?? user.role}
          </span>
        ) : (
          <span className="text-text-muted">—</span>
        )}
      </td>
      <td className="px-5 py-4 text-text-muted">{date}</td>
      <td className="px-5 py-4">
        {user.isAdmin && (
          <span className="rounded-full bg-brand-100/10 px-3 py-1 text-[12px] font-semibold text-brand-100">
            Admin
          </span>
        )}
      </td>
    </tr>
  );
}
