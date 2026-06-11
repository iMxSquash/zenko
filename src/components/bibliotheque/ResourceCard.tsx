import { CATEGORY_COVER_BG } from '@/lib/bibliotheque/bibliotheque';
import { cn } from '@/lib/utils';
import type { Fiche } from '@/types';

interface ResourceCardProps {
  fiche: Fiche;
  className?: string;
}

export function ResourceCard({ fiche, className }: ResourceCardProps) {
  return (
    <article
      className={cn(
        'flex flex-1 flex-col overflow-hidden rounded-card border border-border bg-surface',
        className
      )}
    >
      <div className={cn('h-[140px] w-full shrink-0', CATEGORY_COVER_BG[fiche.category])} />

      <div className="flex flex-col gap-2.5 p-5">
        <div className="self-start rounded-[6px] bg-neutral-100 px-2 py-[3px]">
          <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-secondary">
            {fiche.category}
          </span>
        </div>

        <p className="text-[16px] font-semibold leading-[22px] text-text-primary">{fiche.title}</p>

        <p className="text-[13px] font-normal leading-5 text-text-secondary">{fiche.description}</p>

        <div className="flex items-center gap-2 pt-1">
          {fiche.authorAvatarUrl ? (
            <img
              src={fiche.authorAvatarUrl}
              alt=""
              className="size-5 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="size-5 shrink-0 rounded-full bg-neutral-100" />
          )}
          <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-text-muted">
            {fiche.author}
          </span>
        </div>
      </div>
    </article>
  );
}
