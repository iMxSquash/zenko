import { Button, ConfirmDialog } from '@/components/ui';
import type { FieldStatus as FieldStatusValue } from '@/hooks/useEditableField';
import { useDeleteAccount } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { FieldStatus } from './FieldStatus';

interface ProfileAccountSectionProps {
  className?: string;
}

export function ProfileAccountSection({ className }: ProfileAccountSectionProps) {
  const deleteAccount = useDeleteAccount();
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
      <p className="text-body-sm text-text-secondary">
        La suppression de votre compte est définitive et entraîne la perte de toutes vos données.
      </p>
      <div>
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
