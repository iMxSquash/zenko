import { Button, Capsule, SearchInput } from '@/components/ui';
import { useCreateThread, useForumThreads } from '@/hooks/useForum';
import { useProfile } from '@/hooks/useProfile';
import { CATEGORY_CAPSULE_BG } from '@/lib/categories/categories';
import { CATEGORIES, ROLE_CAPSULE_BG, ROLE_LABELS } from '@/lib/forum/forum';
import { getDisplayName } from '@/lib/profile/profile';
import { useAuth } from '@/lib/supabase/use-auth';
import { cn, formatDate } from '@/lib/utils';
import type { ForumThread, ResourceCategory } from '@/types';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

function ThreadCard({ thread }: { thread: ForumThread }) {
  const navigate = useNavigate();

  return (
    <Link
      to="/forum/$threadId"
      params={{ threadId: thread.id }}
      className="flex flex-col gap-2.5 rounded-search border border-border-default bg-surface p-4 transition-shadow hover:shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <Capsule className={CATEGORY_CAPSULE_BG[thread.category]}>{thread.category}</Capsule>
        <Capsule className={ROLE_CAPSULE_BG[thread.author.role]}>
          {ROLE_LABELS[thread.author.role]}
        </Capsule>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-body-lg font-semibold leading-6.5 text-text-primary">{thread.title}</p>
        <p className="text-body-sm font-normal leading-5 text-text-muted">
          Par{' '}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate({ to: '/profile/$userId', params: { userId: thread.author.userId } });
            }}
            className="font-medium text-text-secondary hover:underline"
          >
            {thread.author.name}
          </button>{' '}
          · {formatDate(thread.createdAt)} · {thread.replies.length} réponse
          {thread.replies.length !== 1 ? 's' : ''}
        </p>
      </div>
    </Link>
  );
}

export function Forum() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: threads = [], isLoading, error } = useForumThreads();
  const { data: profile } = useProfile();
  const createThread = useCreateThread();

  const [activeCategory, setActiveCategory] = useState<ResourceCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('TSA');
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = threads
    .filter((t) => activeCategory === 'all' || t.category === activeCategory)
    .filter((t) => !search || t.title.toLowerCase().includes(search.toLowerCase()));

  const pinned = filtered.filter((t) => t.isPinned);
  const regular = filtered.filter((t) => !t.isPinned);

  function handleCancel() {
    setShowForm(false);
    setTitle('');
    setContent('');
    setFormError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setFormError(null);
    createThread.mutate(
      {
        title,
        content,
        category,
        authorName: getDisplayName(profile),
        authorRole: profile.role ?? 'parent',
      },
      {
        onSuccess: (data) => {
          handleCancel();
          navigate({ to: '/forum/$threadId', params: { threadId: data.id } });
        },
        onError: (err) => {
          setFormError(err instanceof Error ? err.message : 'Une erreur est survenue.');
        },
      }
    );
  }

  if (isLoading) return <div className="p-8 text-text-muted">Chargement…</div>;
  if (error) return <div className="p-8 text-danger">Une erreur est survenue.</div>;

  return (
    <div className="flex flex-col gap-8 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-h2 font-bold leading-9 tracking-[-0.003em] text-text-primary">Forum</h1>
        <p className="text-[16px] font-normal leading-6 text-text-secondary">
          Des conversations entre parents / enseignants / professionnels
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Rechercher une discussion..."
          />

          {/* Category filter — scroll horizontal sur mobile, inline sur desktop */}
          <div className="-mx-4 overflow-x-auto overscroll-x-contain px-4 md:mx-0 md:overflow-visible md:px-0 scrollbar-none [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-2.5 pb-0.5 md:pb-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(activeCategory === cat ? 'all' : cat)}
                  className={cn(
                    'flex h-10 shrink-0 items-center justify-center rounded-capsule border px-3 text-capsule font-semibold uppercase tracking-[0.06em] transition-colors',
                    activeCategory === cat
                      ? 'border-brand-100 bg-bleu-25 text-brand'
                      : 'border-border bg-neutral-100 text-text-secondary hover:border-border-default'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        {user ? (
          <Button type="button" onClick={() => setShowForm(true)} className="w-fit">
            Ouvrir une conversation
          </Button>
        ) : (
          <Link
            to="/login"
            className="w-fit rounded-full bg-brand-100 px-5 py-2.5 text-body-sm font-semibold text-[#f4f4f7] transition-opacity hover:opacity-90"
          >
            Se connecter pour ouvrir une conversation
          </Link>
        )}
      </div>

      {/* Thread list */}
      <div className="flex flex-col gap-3">
        {[...pinned, ...regular].map((thread) => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-body-sm text-text-muted">
            Aucune discussion pour l'instant.
          </p>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 px-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-card bg-surface p-6 shadow-xl"
          >
            <h2 className="mb-5 text-h3 font-semibold text-text-primary">
              Ouvrir une conversation
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="thread-title"
                  className="mb-1 block text-label font-medium text-text-secondary"
                >
                  Titre
                </label>
                <input
                  id="thread-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Ex : Comment gérer les crises sensorielles à l'école ?"
                  className="w-full rounded-[8px] border border-border-default bg-background px-3 py-2 text-body-sm text-text-primary outline-none focus:border-brand"
                />
              </div>

              <div>
                <label
                  htmlFor="thread-category"
                  className="mb-1 block text-label font-medium text-text-secondary"
                >
                  Catégorie
                </label>
                <select
                  id="thread-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                  className="w-full rounded-[8px] border border-border-default bg-background px-3 py-2 text-body-sm text-text-primary outline-none focus:border-brand"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="thread-content"
                  className="mb-1 block text-label font-medium text-text-secondary"
                >
                  Message
                </label>
                <textarea
                  id="thread-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={5}
                  placeholder="Décrivez votre situation ou posez votre question..."
                  className="w-full resize-none rounded-[8px] border border-border-default bg-background px-3 py-2 text-body-sm text-text-primary outline-none focus:border-brand"
                />
              </div>

              {formError && <p className="text-body-sm text-danger">{formError}</p>}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-[8px] px-4 py-2 text-body-sm font-medium text-text-secondary hover:bg-background"
              >
                Annuler
              </button>
              <Button
                type="submit"
                disabled={createThread.isPending || !profile}
                className="px-5 py-2"
              >
                {createThread.isPending ? 'Publication…' : 'Publier'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
