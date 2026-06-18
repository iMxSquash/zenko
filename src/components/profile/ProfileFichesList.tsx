import { CapsuleFiche } from '@/components/ui';
import { useFichesByAuthor } from '@/hooks/useBibliotheque';
import { CATEGORY_COVER_BG } from '@/lib/bibliotheque/bibliotheque';
import { cn } from '@/lib/utils';
import { Clock } from '@phosphor-icons/react';
import { Link } from '@tanstack/react-router';

interface ProfileFichesListProps {
  userId: string;
}

export function ProfileFichesList({ userId }: ProfileFichesListProps) {
  const { data: fiches = [], isLoading, error } = useFichesByAuthor(userId);

  return (
    <section className="flex flex-col gap-4 rounded-card-lg border border-border bg-surface p-6 shadow-[0px_4px_16px_0px_rgba(23,23,20,0.05)]">
      <h2 className="text-h3 font-bold text-text-primary">Fiches publiées</h2>

      {isLoading && <p className="text-body-sm text-text-secondary">Chargement…</p>}
      {error && <p className="text-body-sm text-danger">Impossible de charger les fiches.</p>}

      {!isLoading && !error && fiches.length === 0 && (
        <p className="text-body-sm text-text-secondary">
          Cet expert n'a pas encore publié de fiche.
        </p>
      )}

      {fiches.length > 0 && (
        <div className="flex flex-col gap-3">
          {fiches.map((fiche) => (
            <Link
              key={fiche.slug}
              to="/bibliotheque/$slug"
              params={{ slug: fiche.slug }}
              className="flex gap-4 overflow-hidden rounded-search border border-border-default bg-surface transition-shadow hover:shadow-sm"
            >
              <div
                className={cn(
                  'h-auto w-20 shrink-0 object-cover',
                  !fiche.coverImageUrl && CATEGORY_COVER_BG[fiche.category]
                )}
              >
                {fiche.coverImageUrl && (
                  <img src={fiche.coverImageUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>

              <div className="flex flex-1 flex-col justify-center gap-1.5 py-3 pr-4">
                <CapsuleFiche category={fiche.category} />
                <p className="text-body-md font-semibold leading-5.5 text-text-primary">
                  {fiche.title}
                </p>
                {fiche.readingTimeMinutes && (
                  <div className="flex items-center gap-1 text-text-muted">
                    <Clock size={12} />
                    <span className="text-[11px] font-medium">{fiche.readingTimeMinutes} min</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
