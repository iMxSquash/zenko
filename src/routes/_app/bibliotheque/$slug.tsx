import {
  useFiche,
  useIsSaved,
  useMarkFicheCompleted,
  useReadingProgress,
  useSaveResource,
  useStartReading,
} from '@/hooks/useBibliotheque';
import { CATEGORY_BADGE_BG } from '@/lib/bibliotheque/bibliotheque';
import { useAuth } from '@/lib/supabase/use-auth';
import { cn } from '@/lib/utils';
import { Link, createFileRoute } from '@tanstack/react-router';
import { Bookmark, BookmarkCheck, Clock } from 'lucide-react';
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const Route = createFileRoute('/_app/bibliotheque/$slug')({
  component: FicheDetailPage,
});

function FicheDetailPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();

  const { data: fiche, isLoading, error } = useFiche(slug);
  const { data: progress, isLoading: progressLoading } = useReadingProgress(slug, !!user);
  const { data: isSaved = false } = useIsSaved(slug, !!user);

  const { mutate: startReading } = useStartReading();
  const { mutate: markCompleted } = useMarkFicheCompleted();
  const { mutate: saveResource, isPending: isSaving } = useSaveResource();

  const isCompleted = !!progress?.completedAt;
  const bottomRef = useRef<HTMLDivElement>(null);

  // Track start of reading on mount
  useEffect(() => {
    if (!user) return;
    startReading(slug);
  }, [slug, user, startReading]);

  // Auto-mark as completed when user reaches the bottom
  useEffect(() => {
    if (!user || !fiche || progressLoading || isCompleted || !bottomRef.current) return;

    const el = bottomRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) markCompleted(slug);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [user, fiche, progressLoading, isCompleted, slug, markCompleted]);

  return (
    <>
      {/* Sticky header — always visible while scrolling */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-8 py-4">
        <Link
          to="/bibliotheque"
          className="flex items-center gap-2 text-[15px] font-semibold text-text-secondary transition-opacity hover:opacity-70"
        >
          <span className="rotate-180 font-bold">→</span>
          <span>Retour</span>
        </Link>

        {user ? (
          <button
            type="button"
            disabled={isSaving}
            onClick={() => saveResource({ slug, save: !isSaved })}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors',
              isSaved
                ? 'bg-brand text-white hover:bg-brand/90'
                : 'border border-border bg-surface text-text-active hover:bg-neutral-100'
            )}
          >
            {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            {isSaved ? 'Enregistré' : 'Enregistrer'}
          </button>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-text-active transition-colors hover:bg-neutral-100"
          >
            <Bookmark size={15} />
            Se connecter pour enregistrer
          </Link>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-5 px-8 py-6">
        {isLoading && <FicheDetailSkeleton />}

        {error && (
          <p className="text-body-sm text-text-muted">
            Une erreur est survenue lors du chargement de la fiche.
          </p>
        )}

        {fiche && (
          <>
            <div className="flex flex-col gap-2">
              <div
                className={cn(
                  'self-start rounded-[6px] px-2 py-0.75',
                  CATEGORY_BADGE_BG[fiche.category]
                )}
              >
                <span className="text-[20px] font-semibold tracking-[1.2px] text-text-secondary">
                  {fiche.category}
                </span>
              </div>

              <h1 className="text-h2 font-bold leading-9 tracking-[-0.084px] text-text-primary">
                {fiche.title}
              </h1>

              <p className="text-body-lg font-normal leading-7 text-text-primary">
                {fiche.description}
              </p>
            </div>

            {fiche.readingTimeMinutes && (
              <div className="flex items-center gap-2">
                <Clock size={15} className="shrink-0 text-text-muted" />
                <span className="text-label font-medium text-text-muted">
                  {fiche.readingTimeMinutes} min de lecture
                </span>
              </div>
            )}

            {fiche.content ? (
              <div className="px-24">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node: _, ...props }) => (
                      <h1
                        className="mb-4 mt-8 text-[24px] font-bold leading-tight text-text-primary"
                        {...props}
                      />
                    ),
                    h2: ({ node: _, ...props }) => (
                      <h2
                        className="mb-3 mt-6 text-[20px] font-bold leading-snug text-text-primary"
                        {...props}
                      />
                    ),
                    h3: ({ node: _, ...props }) => (
                      <h3
                        className="mb-2 mt-4 text-[17px] font-semibold text-text-primary"
                        {...props}
                      />
                    ),
                    p: ({ node: _, ...props }) => (
                      <p
                        className="mb-4 text-justify text-[17px] font-normal leading-6 text-text-primary last:mb-0"
                        {...props}
                      />
                    ),
                    ul: ({ node: _, ...props }) => (
                      <ul
                        className="mb-4 list-disc pl-6 text-[17px] leading-6 text-text-primary"
                        {...props}
                      />
                    ),
                    ol: ({ node: _, ...props }) => (
                      <ol
                        className="mb-4 list-decimal pl-6 text-[17px] leading-6 text-text-primary"
                        {...props}
                      />
                    ),
                    li: ({ node: _, ...props }) => <li className="mb-1" {...props} />,
                    strong: ({ node: _, ...props }) => (
                      <strong className="font-semibold text-text-primary" {...props} />
                    ),
                    em: ({ node: _, ...props }) => <em className="italic" {...props} />,
                    blockquote: ({ node: _, ...props }) => (
                      <blockquote
                        className="mb-4 border-l-4 border-border pl-4 italic text-text-secondary"
                        {...props}
                      />
                    ),
                    code: ({ node: _, ...props }) => (
                      <code
                        className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[15px] text-text-secondary"
                        {...props}
                      />
                    ),
                  }}
                >
                  {fiche.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="px-24">
                <p className="text-body-sm italic text-text-muted">
                  Le contenu de cette fiche n'est pas encore disponible.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 px-24 pb-16">
              {fiche.authorAvatarUrl ? (
                <img
                  src={fiche.authorAvatarUrl}
                  alt=""
                  className="size-5 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="size-5 shrink-0 rounded-full bg-neutral-100" />
              )}
              <span className="text-[17px] font-medium text-text-secondary">{fiche.author}</span>
            </div>

            {/* Sentinel — IntersectionObserver fires when this is visible */}
            <div ref={bottomRef} className="h-px" />
          </>
        )}
      </div>
    </>
  );
}

function FicheDetailSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4 px-8 py-6">
      <div className="h-8 w-16 rounded-[6px] bg-neutral-100" />
      <div className="h-9 w-3/4 rounded bg-neutral-100" />
      <div className="h-6 w-full rounded bg-neutral-100" />
      <div className="h-4 w-28 rounded bg-neutral-100" />
      <div className="flex flex-col gap-2 px-24 pt-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-4 w-full rounded bg-neutral-100" />
        ))}
      </div>
    </div>
  );
}
