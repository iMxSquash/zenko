import { ResourceCard } from '@/components/bibliotheque/ResourceCard';
import { useSavedFiches } from '@/hooks/useBibliotheque';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/_app/favoris/')({
  component: FavorisPage,
});

function FavorisPage() {
  const { data: fiches = [], isLoading, error } = useSavedFiches();

  return (
    <div className="flex flex-col gap-8 px-8 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] font-bold tracking-[-0.01em] text-text-primary">Favoris</h1>
        <p className="text-[15px] text-text-secondary">Les fiches que vous avez enregistrées.</p>
      </div>

      {isLoading && (
        <div className="flex gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-1 animate-pulse overflow-hidden rounded-card border border-border bg-surface"
            >
              <div className="h-35 w-full bg-neutral-100" />
              <div className="flex flex-col gap-2.5 p-5">
                <div className="h-4 w-12 rounded bg-neutral-100" />
                <div className="h-5 w-full rounded bg-neutral-100" />
                <div className="h-4 w-3/4 rounded bg-neutral-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-body-sm text-text-muted">
          Une erreur est survenue lors du chargement de vos favoris.
        </p>
      )}

      {!isLoading && !error && fiches.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-[20px] font-semibold text-text-primary">Aucun favori pour l'instant</p>
          <p className="text-[15px] text-text-secondary">
            Enregistrez une fiche depuis son bouton "Enregistrer" pour la retrouver ici.
          </p>
          <Link
            to="/bibliotheque"
            className="mt-2 rounded-full bg-brand px-5 py-2.5 text-body-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Parcourir la bibliothèque
          </Link>
        </div>
      )}

      {!isLoading && !error && fiches.length > 0 && (
        <div className="flex flex-wrap gap-5">
          {fiches.map((fiche) => (
            <Link
              key={fiche.slug}
              to="/bibliotheque/$slug"
              params={{ slug: fiche.slug }}
              className="min-w-55 max-w-[calc(25%-15px)] flex-1 transition-transform hover:-translate-y-0.5"
            >
              <ResourceCard fiche={fiche} className="h-full" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
