import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog';
import { useAdminForumThreads, useDeleteForumReply, useDeleteForumThread } from '@/hooks/useAdmin';
import type { AdminThread } from '@/hooks/useAdmin';
import { cn } from '@/lib/utils';
import { CaretDown, CaretRight, Trash } from '@phosphor-icons/react';
import { useState } from 'react';

type PendingDelete =
  | { type: 'thread'; id: string; label: string }
  | { type: 'reply'; replyId: string; threadId: string; label: string };

export function AdminForum() {
  const { data: threads, isLoading, error } = useAdminForumThreads();
  const deleteThread = useDeleteForumThread();
  const deleteReply = useDeleteForumReply();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<PendingDelete | null>(null);

  if (isLoading) return <div className="p-8 text-text-muted">Chargement…</div>;
  if (error) return <div className="p-8 text-danger">Une erreur est survenue.</div>;

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    if (!pending) return;
    if (pending.type === 'thread') {
      deleteThread.mutate(pending.id, { onSettled: () => setPending(null) });
    } else {
      deleteReply.mutate(
        { replyId: pending.replyId, threadId: pending.threadId },
        { onSettled: () => setPending(null) }
      );
    }
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-h2 font-bold text-text-primary">Modération forum</h1>

      <div className="flex flex-col gap-3">
        {threads?.map((thread) => (
          <ThreadBlock
            key={thread.id}
            thread={thread}
            isExpanded={expanded.has(thread.id)}
            onToggle={() => toggleExpand(thread.id)}
            onDeleteThread={() =>
              setPending({ type: 'thread', id: thread.id, label: thread.title })
            }
            onDeleteReply={(replyId, content) =>
              setPending({
                type: 'reply',
                replyId,
                threadId: thread.id,
                label: content.slice(0, 60),
              })
            }
          />
        ))}
        {threads?.length === 0 && (
          <p className="py-8 text-center text-text-muted">Aucun thread pour le moment.</p>
        )}
      </div>

      <ConfirmDialog
        open={!!pending}
        title={pending?.type === 'thread' ? 'Supprimer le thread ?' : 'Supprimer la réponse ?'}
        description={pending ? `"${pending.label}" — cette action est irréversible.` : ''}
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}

function ThreadBlock({
  thread,
  isExpanded,
  onToggle,
  onDeleteThread,
  onDeleteReply,
}: {
  thread: AdminThread;
  isExpanded: boolean;
  onToggle: () => void;
  onDeleteThread: () => void;
  onDeleteReply: (replyId: string, content: string) => void;
}) {
  const date = new Date(thread.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="rounded-card bg-surface shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 text-text-muted transition-colors hover:text-text-primary"
          aria-label={isExpanded ? 'Réduire' : 'Voir les réponses'}
        >
          {isExpanded ? <CaretDown size={16} /> : <CaretRight size={16} />}
        </button>

        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-semibold text-text-primary truncate">{thread.title}</span>
          <span className="text-[12px] text-text-muted">
            {thread.authorName} · {date} ·{' '}
            <span className={cn('font-medium', thread.replyCount > 0 && 'text-brand-100')}>
              {thread.replyCount} réponse{thread.replyCount !== 1 ? 's' : ''}
            </span>
          </span>
        </div>

        <span className="shrink-0 rounded-full bg-background px-3 py-1 text-[12px] font-semibold text-text-secondary">
          {thread.category}
        </span>

        <button
          type="button"
          onClick={onDeleteThread}
          className="flex size-8 shrink-0 items-center justify-center rounded-nav text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
          title="Supprimer le thread"
        >
          <Trash size={15} />
        </button>
      </div>

      {isExpanded && thread.replies.length > 0 && (
        <div className="border-t border-border">
          {thread.replies.map((reply) => (
            <div
              key={reply.id}
              className="flex items-start gap-3 border-b border-border last:border-0 px-5 py-3 pl-12"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[12px] font-semibold text-text-secondary">
                  {reply.authorName}
                </span>
                <p className="text-body-sm text-text-primary line-clamp-2">{reply.content}</p>
              </div>
              <button
                type="button"
                onClick={() => onDeleteReply(reply.id, reply.content)}
                className="flex size-7 shrink-0 items-center justify-center rounded-nav text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                title="Supprimer la réponse"
              >
                <Trash size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
