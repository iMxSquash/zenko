import { Capsule } from '@/components/ui';
import { useUserForumActivity } from '@/hooks/useForum';
import { CATEGORY_CAPSULE_BG } from '@/lib/categories/categories';
import { formatDate } from '@/lib/utils';
import { Link } from '@tanstack/react-router';

interface ProfileForumActivityProps {
  userId?: string;
}

export function ProfileForumActivity({ userId }: ProfileForumActivityProps = {}) {
  const { data, isLoading, error } = useUserForumActivity(userId);

  return (
    <section className="flex flex-col gap-4 rounded-card-lg border border-border bg-surface p-6 shadow-[0px_4px_16px_0px_rgba(23,23,20,0.05)]">
      <h2 className="text-h3 font-bold text-text-primary">Participations au forum</h2>

      {isLoading && <p className="text-body-sm text-text-secondary">Chargement…</p>}
      {error && <p className="text-body-sm text-danger">Impossible de charger l'activité.</p>}

      {data && data.threads.length === 0 && data.replies.length === 0 && (
        <p className="text-body-sm text-text-secondary">
          {userId
            ? "Cet utilisateur n'a pas encore participé au forum."
            : "Vous n'avez pas encore participé au forum."}
        </p>
      )}

      {data && data.threads.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-label font-semibold uppercase tracking-label text-text-secondary">
            Discussions créées
          </p>
          {data.threads.map((thread) => (
            <Link
              key={thread.id}
              to="/forum/$threadId"
              params={{ threadId: thread.id }}
              className="flex flex-col gap-2 rounded-search border border-border-default bg-surface p-4 transition-shadow hover:shadow-sm"
            >
              <Capsule className={CATEGORY_CAPSULE_BG[thread.category]}>{thread.category}</Capsule>
              <p className="text-body-lg font-semibold leading-6.5 text-text-primary">
                {thread.title}
              </p>
              <p className="text-body-sm text-text-muted">{formatDate(thread.createdAt)}</p>
            </Link>
          ))}
        </div>
      )}

      {data && data.replies.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-label font-semibold uppercase tracking-label text-text-secondary">
            Réponses postées
          </p>
          {data.replies.map((reply) => (
            <Link
              key={reply.id}
              to="/forum/$threadId"
              params={{ threadId: reply.threadId }}
              className="flex flex-col gap-2 rounded-search border border-border-default bg-surface p-4 transition-shadow hover:shadow-sm"
            >
              <p className="text-body-sm text-text-muted">
                Dans <span className="font-semibold text-text-primary">{reply.threadTitle}</span>
              </p>
              <p className="text-body-sm text-text-secondary">{reply.content}</p>
              <p className="text-body-sm text-text-muted">{formatDate(reply.createdAt)}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
