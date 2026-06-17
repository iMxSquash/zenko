import { Capsule } from '@/components/ui';
import { useAddReply, useForumThread } from '@/hooks/useForum';
import { useProfile } from '@/hooks/useProfile';
import { CATEGORY_CAPSULE_BG } from '@/lib/categories/categories';
import { ROLE_CAPSULE_BG, ROLE_LABELS } from '@/lib/forum/forum';
import { getDisplayName } from '@/lib/profile/profile';
import { useAuth } from '@/lib/supabase/use-auth';
import { formatDate } from '@/lib/utils';
import type { ForumReply } from '@/types';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';

function ReplyCard({ reply }: { reply: ForumReply }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-search border border-border bg-background p-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          to="/profile/$userId"
          params={{ userId: reply.author.userId }}
          className="text-body-sm font-semibold leading-5 text-text-primary hover:underline"
        >
          {reply.author.name}
        </Link>
        <Capsule className={ROLE_CAPSULE_BG[reply.author.role]}>
          {ROLE_LABELS[reply.author.role]}
        </Capsule>
        <span className="text-label text-text-muted">{formatDate(reply.createdAt, true)}</span>
      </div>
      <p className="text-body-sm font-normal leading-5 text-text-secondary">{reply.content}</p>
    </div>
  );
}

function ReplyForm({ threadId }: { threadId: string }) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const addReply = useAddReply();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !profile) return;
    setError(null);
    addReply.mutate(
      {
        threadId,
        content,
        authorName: getDisplayName(profile),
        authorRole: profile.role ?? 'parent',
      },
      {
        onSuccess: () => setContent(''),
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
        },
      }
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-search border border-border-default bg-surface p-6 text-center">
        <p className="text-body-sm font-medium text-text-secondary">
          Connectez-vous pour répondre à cette discussion.
        </p>
        <Link
          to="/login"
          className="rounded-full bg-brand-100 px-5 py-2 font-display text-[16px] font-semibold text-[#f4f4f7] transition-opacity hover:opacity-90"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-search border border-border-default bg-surface p-4"
    >
      <p className="text-body-lg font-semibold leading-6.5 text-text-primary">
        Ajouter une réponse
      </p>

      <div>
        <label
          htmlFor="reply-content"
          className="mb-1 block text-label font-medium text-text-secondary"
        >
          Message
        </label>
        <textarea
          id="reply-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          placeholder="Partagez votre expérience ou conseil..."
          className="w-full resize-none rounded-[8px] border border-border-default bg-background px-3 py-2 text-body-sm text-text-primary outline-none focus:border-brand"
        />
      </div>

      {error && <p className="text-body-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={addReply.isPending || !content.trim() || !profile}
        className="w-fit rounded-full bg-brand-100 px-5 py-2 font-display text-[16px] font-semibold text-[#f4f4f7] transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {addReply.isPending ? 'Envoi…' : 'Répondre'}
      </button>
    </form>
  );
}

interface ThreadDetailProps {
  threadId: string;
}

export function ThreadDetail({ threadId }: ThreadDetailProps) {
  const { data: thread, isLoading, error } = useForumThread(threadId);

  if (isLoading) return <div className="p-8 text-text-muted">Chargement…</div>;
  if (error || !thread) return <div className="p-8 text-danger">Discussion introuvable.</div>;

  return (
    <div className="flex flex-col gap-8 px-4 py-8">
      <Link to="/forum" className="w-fit text-body-sm text-text-muted hover:text-text-secondary">
        ← Retour au forum
      </Link>

      {/* Thread */}
      <div className="flex flex-col gap-2.5 rounded-search border border-border-default bg-surface p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <Capsule className={CATEGORY_CAPSULE_BG[thread.category]}>{thread.category}</Capsule>
          <Capsule className={ROLE_CAPSULE_BG[thread.author.role]}>
            {ROLE_LABELS[thread.author.role]}
          </Capsule>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-h2 font-bold leading-9 tracking-[-0.003em] text-text-primary">
            {thread.title}
          </h1>
          <p className="text-body-sm font-normal leading-5 text-text-muted">
            <Link
              to="/profile/$userId"
              params={{ userId: thread.author.userId }}
              className="hover:underline"
            >
              {thread.author.name}
            </Link>{' '}
            · {formatDate(thread.createdAt, true)}
          </p>
        </div>
        <p className="text-body-sm font-normal leading-5 text-text-secondary">{thread.content}</p>
      </div>

      {/* Replies */}
      <div className="flex flex-col gap-3">
        {thread.replies.length > 0 && (
          <p className="text-capsule font-semibold uppercase tracking-[0.06em] text-text-muted">
            {thread.replies.length} réponse
            {thread.replies.length !== 1 ? 's' : ''}
          </p>
        )}
        {thread.replies.map((reply) => (
          <ReplyCard key={reply.id} reply={reply} />
        ))}
        {thread.replies.length === 0 && (
          <p className="py-6 text-center text-body-sm text-text-muted">
            Aucune réponse pour l'instant - soyez le premier·e à contribuer.
          </p>
        )}
      </div>

      <ReplyForm threadId={thread.id} />
    </div>
  );
}
