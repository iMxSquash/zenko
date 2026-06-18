import { Button, ConfirmDialog } from '@/components/ui';
import type { FieldStatus as FieldStatusValue } from '@/hooks/useEditableField';
import { useDeleteAccount, useExportData } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { FieldStatus } from './FieldStatus';

interface ProfileAccountSectionProps {
  className?: string;
}

export function ProfileAccountSection({ className }: ProfileAccountSectionProps) {
  const deleteAccount = useDeleteAccount();
  const exportData = useExportData();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [status, setStatus] = useState<FieldStatusValue>('idle');
  const [error, setError] = useState<string>();

  const handleDelete = () => {
    setConfirmOpen(false);
    setStatus('saving');
    setError(undefined);
    deleteAccount.mutate(undefined, {
      onError: (err) => {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      },
    });
  };

  return (
    <section
      className={cn(
        'flex flex-col gap-4 rounded-card-lg border border-border bg-surface p-6 shadow-[0px_4px_16px_0px_rgba(23,23,20,0.05)]',
        className
      )}
    >
      <h2 className="text-h3 font-bold text-text-primary">Compte</h2>

      <div className="flex flex-col gap-2">
        <p className="text-body-sm font-medium text-text-primary">Mes données personnelles</p>
        <p className="text-body-sm text-text-secondary">
          Téléchargez une copie de toutes vos données (profil, conversations, forum, progression).
        </p>
        <div>
          <Button
            variant="outline"
            onClick={() => exportData.mutate()}
            disabled={exportData.isPending}
          >
            {exportData.isPending ? 'Préparation…' : 'Télécharger mes données'}
          </Button>
        </div>
        {exportData.isError && (
          <p className="text-body-sm text-danger">
            {exportData.error instanceof Error
              ? exportData.error.message
              : 'Une erreur est survenue.'}
          </p>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-3 text-body-sm text-text-secondary">
          La suppression de votre compte est définitive et entraîne la perte de toutes vos données.
        </p>
        <Button
          variant="danger"
          onClick={() => setConfirmOpen(true)}
          disabled={status === 'saving'}
        >
          Supprimer mon compte
        </Button>
      </div>
      <FieldStatus status={status} error={error} />

      <ConfirmDialog
        open={confirmOpen}
        title="Supprimer mon compte"
        description="Cette action est irréversible. Toutes vos données seront définitivement supprimées."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
}
