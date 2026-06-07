import { CapsuleFiche } from '@/components/ui';
import { CATEGORY_COVER_BG } from '@/lib/bibliotheque/bibliotheque';
import { cn } from '@/lib/utils';
import type { Fiche } from '@/types';

interface FicheCardProps {
  fiche: Fiche;
  className?: string;
}

export function FicheCard({ fiche, className }: FicheCardProps) {
  return (
    <article
      className={cn('overflow-hidden rounded-card border border-border bg-surface', className)}
    >
      <div className={cn('h-35 w-full', CATEGORY_COVER_BG[fiche.category])} />

      <div className="flex flex-col gap-2.5 p-5">
        <CapsuleFiche category={fiche.category} />

        <p className="text-body-md font-semibold leading-5.5 text-text-primary">{fiche.title}</p>

        <p className="text-[13px] font-normal leading-5 text-text-secondary">{fiche.description}</p>

        <div className="flex items-center gap-2">
          {fiche.authorAvatarUrl ? (
            <img src={fiche.authorAvatarUrl} alt="" className="size-5 rounded-full object-cover" />
          ) : (
            <div className="size-5 rounded-full bg-neutral-100" />
          )}
          <span className="text-[11px] font-medium text-text-muted">{fiche.author}</span>
        </div>
      </div>
    </article>
  );
}
