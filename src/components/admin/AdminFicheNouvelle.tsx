import { FicheForm } from '@/components/admin/FicheForm';
import { useCreateFiche } from '@/hooks/useAdmin';
import type { FicheInput } from '@/hooks/useAdmin';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

export function AdminFicheNouvelle() {
  const createFiche = useCreateFiche();
  const navigate = useNavigate();
  const [saveError, setSaveError] = useState<string | null>(null);

  function handleSubmit(input: FicheInput) {
    setSaveError(null);
    createFiche.mutate(input, {
      onSuccess: () => navigate({ to: '/admin/fiches' }),
      onError: (err) =>
        setSaveError(
          (err as { message?: string })?.message ?? (err instanceof Error ? err.message : 'Erreur inconnue')
        ),
    });
  }

  return (
    <div className="p-8">
      <h1 className="mb-8 text-h2 font-bold text-text-primary">Nouvelle fiche</h1>

      {saveError && (
        <div className="mb-6 rounded-card bg-danger/10 px-4 py-3 text-body-sm text-danger">
          {saveError}
        </div>
      )}

      <div className="max-w-2xl">
        <FicheForm
          isCreating
          isPending={createFiche.isPending}
          onSubmit={handleSubmit}
          onCancel={() => navigate({ to: '/admin/fiches' })}
        />
      </div>
    </div>
  );
}
