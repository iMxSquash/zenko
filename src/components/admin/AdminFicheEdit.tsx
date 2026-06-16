import { FicheForm } from '@/components/admin/FicheForm';
import { useAdminFiches, useUpdateFiche } from '@/hooks/useAdmin';
import type { FicheInput } from '@/hooks/useAdmin';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

interface AdminFicheEditProps {
  slug: string;
}

export function AdminFicheEdit({ slug }: AdminFicheEditProps) {
  const { data: fiches, isLoading, error } = useAdminFiches();
  const updateFiche = useUpdateFiche();
  const navigate = useNavigate();
  const [saveError, setSaveError] = useState<string | null>(null);

  const fiche = fiches?.find((f) => f.slug === slug);

  if (isLoading) return <div className="p-8 text-text-muted">Chargement…</div>;
  if (error || !fiche) return <div className="p-8 text-danger">Fiche introuvable.</div>;

  function handleSubmit(input: FicheInput) {
    setSaveError(null);
    updateFiche.mutate(
      { slug, input },
      {
        onSuccess: () => navigate({ to: '/admin/fiches' }),
        onError: (err) =>
          setSaveError(
            (err as { message?: string })?.message ?? (err instanceof Error ? err.message : 'Erreur inconnue')
          ),
      }
    );
  }

  return (
    <div className="p-8">
      <h1 className="mb-2 text-h2 font-bold text-text-primary">Éditer la fiche</h1>
      <p className="mb-8 text-body-sm text-text-muted">slug : {slug}</p>

      {saveError && (
        <div className="mb-6 rounded-card bg-danger/10 px-4 py-3 text-body-sm text-danger">
          {saveError}
        </div>
      )}

      <div>
        <FicheForm
          initial={{
            slug: fiche.slug,
            title: fiche.title,
            description: fiche.description,
            category: fiche.category,
            author: fiche.author,
            content: fiche.content,
            readingTimeMinutes: fiche.readingTimeMinutes,
          }}
          isPending={updateFiche.isPending}
          onSubmit={handleSubmit}
          onCancel={() => navigate({ to: '/admin/fiches' })}
        />
      </div>
    </div>
  );
}
