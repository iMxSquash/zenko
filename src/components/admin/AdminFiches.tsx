import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog';
import { useAdminFiches, useDeleteFiche } from '@/hooks/useAdmin';
import type { AdminFiche } from '@/hooks/useAdmin';
import { PencilSimple, Plus, Trash } from '@phosphor-icons/react';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';

export function AdminFiches() {
  const { data: fiches, isLoading, error } = useAdminFiches();
  const deleteFiche = useDeleteFiche();
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);

  if (isLoading) return <div className="p-8 text-text-muted">Chargement…</div>;
  if (error) return <div className="p-8 text-danger">Une erreur est survenue.</div>;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h2 font-bold text-text-primary">Fiches</h1>
        <Link
          to="/admin/fiches/nouvelle"
          className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-5 py-3 text-body-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          Nouvelle fiche
        </Link>
      </div>

      <div className="rounded-card bg-surface shadow-sm overflow-hidden">
        <table className="w-full text-body-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-4 text-left font-semibold text-text-secondary">Titre</th>
              <th className="px-5 py-4 text-left font-semibold text-text-secondary">Catégorie</th>
              <th className="px-5 py-4 text-left font-semibold text-text-secondary">Auteur</th>
              <th className="px-5 py-4 text-left font-semibold text-text-secondary">Date</th>
              <th className="px-5 py-4" />
            </tr>
          </thead>
          <tbody>
            {fiches?.map((fiche) => (
              <FicheRow
                key={fiche.slug}
                fiche={fiche}
                onDelete={() => setConfirmSlug(fiche.slug)}
              />
            ))}
            {fiches?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-text-muted">
                  Aucune fiche pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!confirmSlug}
        title="Supprimer la fiche ?"
        description="Cette action est irréversible. La fiche sera définitivement supprimée."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={() => {
          if (confirmSlug) {
            deleteFiche.mutate(confirmSlug, { onSettled: () => setConfirmSlug(null) });
          }
        }}
        onCancel={() => setConfirmSlug(null)}
      />
    </div>
  );
}

function FicheRow({
  fiche,
  onDelete,
}: {
  fiche: AdminFiche;
  onDelete: () => void;
}) {
  const date = new Date(fiche.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <tr className="border-b border-border last:border-0 hover:bg-background transition-colors">
      <td className="px-5 py-4 font-medium text-text-primary">{fiche.title}</td>
      <td className="px-5 py-4">
        <span className="rounded-full bg-background px-3 py-1 text-[12px] font-semibold text-text-secondary">
          {fiche.category}
        </span>
      </td>
      <td className="px-5 py-4 text-text-secondary">{fiche.author}</td>
      <td className="px-5 py-4 text-text-muted">{date}</td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          <Link
            to="/admin/fiches/$slug"
            params={{ slug: fiche.slug }}
            className="flex size-8 items-center justify-center rounded-nav text-text-muted transition-colors hover:bg-background hover:text-text-primary"
            title="Éditer"
          >
            <PencilSimple size={15} />
          </Link>
          <button
            type="button"
            onClick={onDelete}
            className="flex size-8 items-center justify-center rounded-nav text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
            title="Supprimer"
          >
            <Trash size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}
