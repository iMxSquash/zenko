import { SEOHead } from '@/components/seo/SEOHead';
import { CapsuleFiche } from '@/components/ui';
import {
  useFiche,
  useIsSaved,
  useMarkFicheCompleted,
  useReadingProgress,
  useSaveResource,
  useStartReading,
} from '@/hooks/useBibliotheque';
import { CATEGORY_COVER_BG } from '@/lib/bibliotheque/bibliotheque';
import {
  generateBreadcrumbJsonLd,
  generateLearningResourceJsonLd,
  useJsonLd,
} from '@/lib/seo/jsonld';
import { useAuth } from '@/lib/supabase/use-auth';
import { cn } from '@/lib/utils';
import { useVoice } from '@/lib/voice/useVoice';
import { Bookmark, Clock, SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^>\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .trim();
}
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const Route = createFileRoute('/_app/bibliotheque/$slug')({
  component: FicheDetailPage,
});

function SaveButton({
  isSaved,
  isSaving,
  onToggle,
  className,
}: {
  isSaved: boolean;
  isSaving: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={isSaving}
      onClick={onToggle}
      aria-pressed={isSaved}
      className={cn(
        'flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition-colors',
        isSaved
          ? 'border border-brand bg-brand/10 text-brand hover:bg-brand/15'
          : 'bg-brand text-white hover:bg-brand/90',
        className
      )}
    >
      {isSaved ? (
        <Bookmark weight="fill" size={15} aria-hidden="true" />
      ) : (
        <Bookmark size={15} aria-hidden="true" />
      )}
      {isSaved ? 'Fiche enregistrée' : 'Enregistrer cette fiche'}
    </button>
  );
}

function ReadButton({ isSpeaking, onRead }: { isSpeaking: boolean; onRead: () => void }) {
  return (
    <button
      type="button"
      onClick={onRead}
      aria-pressed={isSpeaking}
      aria-label={isSpeaking ? 'Arrêter la lecture' : 'Lire la fiche à voix haute'}
      className={cn(
        'flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition-colors',
        isSpeaking
          ? 'border border-brand bg-brand/10 text-brand hover:bg-brand/15'
          : 'border border-border bg-surface text-text-secondary hover:bg-neutral-100'
      )}
    >
      {isSpeaking ? (
        <SpeakerSlash size={15} aria-hidden="true" />
      ) : (
        <SpeakerHigh size={15} aria-hidden="true" />
      )}
      {isSpeaking ? 'Arrêter la lecture' : 'Lire la fiche'}
    </button>
  );
}

function FicheDetailPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();

  const { data: fiche, isLoading, error } = useFiche(slug);
  const { data: progress, isLoading: progressLoading } = useReadingProgress(slug, !!user);
  const { data: isSaved = false } = useIsSaved(slug, !!user);

  const { mutate: startReading } = useStartReading();
  const { mutate: markCompleted } = useMarkFicheCompleted();
  const { mutate: saveResource, isPending: isSaving } = useSaveResource();

  const { speak, isSpeaking, stopSpeaking, primeTTS, isSupported } = useVoice();

  const isCompleted = !!progress?.completedAt;
  const bottomRef = useRef<HTMLDivElement>(null);

  useJsonLd(fiche ? generateLearningResourceJsonLd(fiche) : null, 'fiche-jsonld');
  useJsonLd(
    fiche
      ? generateBreadcrumbJsonLd([
          { name: 'Bibliothèque', path: '/bibliotheque' },
          { name: fiche.title, path: `/bibliotheque/${slug}` },
        ])
      : null,
    'fiche-breadcrumb-jsonld'
  );

  // Stop TTS when navigating away
  useEffect(() => {
    return () => stopSpeaking();
  }, [stopSpeaking]);

  const handleRead = () => {
    primeTTS();
    if (isSpeaking) {
      stopSpeaking();
    } else if (fiche) {
      const parts = [
        fiche.title,
        fiche.description,
        fiche.content ? stripMarkdown(fiche.content) : '',
      ].filter(Boolean);
      speak(parts.join('. '));
    }
  };

  useEffect(() => {
    if (!user) return;
    startReading(slug);
  }, [slug, user, startReading]);

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
      <SEOHead
        title={fiche?.title ?? 'Fiche pratique'}
        description={fiche?.description}
        path={`/bibliotheque/${slug}`}
        noIndex={!fiche}
      />

      <div className="flex flex-col gap-16 px-8 py-8 pb-20">
        {isLoading && <FicheDetailSkeleton />}

        {error && (
          <p className="text-body-sm text-text-muted">
            Une erreur est survenue lors du chargement de la fiche.
          </p>
        )}

        {fiche && (
          <>
            {/* Header: back + category + title + description + save */}
            <div className="flex flex-col gap-4">
              <Link
                to="/bibliotheque"
                className="flex w-fit items-center gap-2 text-[15px] font-semibold text-text-secondary transition-opacity hover:opacity-70"
              >
                <span className="rotate-180 font-bold" aria-hidden="true">
                  →
                </span>
                Retour
              </Link>

              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-start gap-3">
                  <CapsuleFiche category={fiche.category} size="lg" className="self-center" />
                  <h1 className="text-display-md font-bold leading-13 tracking-[-0.44px] text-text-primary">
                    {fiche.title}
                  </h1>
                </div>

                <p className="max-w-4xl text-body-lg font-normal leading-7 text-text-secondary">
                  {fiche.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {user ? (
                  <SaveButton
                    isSaved={isSaved}
                    isSaving={isSaving}
                    onToggle={() => saveResource({ slug, save: !isSaved })}
                  />
                ) : (
                  <Link
                    to="/login"
                    className="flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-[13px] font-medium text-text-active transition-colors hover:bg-neutral-100"
                  >
                    <Bookmark size={15} />
                    Se connecter pour enregistrer
                  </Link>
                )}
                {isSupported && <ReadButton isSpeaking={isSpeaking} onRead={handleRead} />}
              </div>
            </div>

            {/* Cover image */}
            {fiche.coverImageUrl ? (
              <div className="h-75 w-full overflow-hidden rounded-4xl lg:h-107">
                <img src={fiche.coverImageUrl} alt="" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div
                className={cn('h-45 w-full rounded-4xl lg:h-70', CATEGORY_COVER_BG[fiche.category])}
              />
            )}

            {/* Body: author sidebar + content */}
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
              {/* Author sidebar */}
              <div className="flex shrink-0 flex-row items-center gap-4 lg:sticky lg:top-8 lg:w-44 lg:flex-col lg:items-start">
                {fiche.authorAvatarUrl ? (
                  <img
                    src={fiche.authorAvatarUrl}
                    alt=""
                    className="size-16 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                    <span className="text-h3 font-bold text-text-muted">
                      {fiche.author[0]?.toUpperCase() ?? '?'}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-0.5">
                  <span className="text-[17px] font-medium text-text-secondary">
                    {fiche.author}
                  </span>
                  {fiche.authorUserId && (
                    <Link
                      to="/profile/$userId"
                      params={{ userId: fiche.authorUserId }}
                      className="text-[13px] font-medium text-brand hover:underline"
                    >
                      Voir le profil
                    </Link>
                  )}
                  {fiche.readingTimeMinutes && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="shrink-0 text-text-muted" />
                      <span className="text-label font-medium text-text-muted">
                        {fiche.readingTimeMinutes} min
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Article content */}
              <div className="flex min-w-0 flex-1 flex-col gap-8">
                {fiche.content ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node: _, ...props }) => (
                        <h2
                          className="mb-4 mt-8 text-[24px] font-bold leading-tight text-text-primary"
                          {...props}
                        />
                      ),
                      h2: ({ node: _, ...props }) => (
                        <h3
                          className="mb-3 mt-6 text-[20px] font-bold leading-snug text-text-primary"
                          {...props}
                        />
                      ),
                      h3: ({ node: _, ...props }) => (
                        <h4
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
                ) : (
                  <p className="text-body-sm italic text-text-muted">
                    Le contenu de cette fiche n'est pas encore disponible.
                  </p>
                )}

                {/* Bottom save CTA */}
                {user ? (
                  <div className="flex justify-end">
                    <SaveButton
                      isSaved={isSaved}
                      isSaving={isSaving}
                      onToggle={() => saveResource({ slug, save: !isSaved })}
                    />
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <Link
                      to="/login"
                      className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-[13px] font-medium text-text-active transition-colors hover:bg-neutral-100"
                    >
                      <Bookmark size={15} />
                      Se connecter pour enregistrer
                    </Link>
                  </div>
                )}

                {/* Sentinel - IntersectionObserver fires when this is visible */}
                <div ref={bottomRef} className="h-px" />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function FicheDetailSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-12">
      <div className="flex flex-col gap-4">
        <div className="h-5 w-20 rounded bg-neutral-100" />
        <div className="h-12 w-3/4 rounded bg-neutral-100" />
        <div className="h-6 w-full max-w-2xl rounded bg-neutral-100" />
        <div className="h-10 w-40 rounded-full bg-neutral-100" />
      </div>
      <div className="h-70 w-full rounded-4xl bg-neutral-100" />
      <div className="flex gap-12">
        <div className="flex w-44 flex-col gap-2">
          <div className="size-16 rounded-full bg-neutral-100" />
          <div className="h-4 w-24 rounded bg-neutral-100" />
        </div>
        <div className="flex flex-1 flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 w-full rounded bg-neutral-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
