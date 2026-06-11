import { Button, TextInput } from '@/components/ui';
import type { FieldStatus as FieldStatusValue } from '@/hooks/useEditableField';
import { useUpdatePassword } from '@/hooks/useProfile';
import { type FormEvent, useState } from 'react';
import { FieldStatus } from './FieldStatus';

export function ProfilePasswordSection() {
  const updatePassword = useUpdatePassword();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<FieldStatusValue>('idle');
  const [error, setError] = useState<string>();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setStatus('error');
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setStatus('saving');
    setError(undefined);
    updatePassword.mutate(password, {
      onSuccess: () => {
        setStatus('saved');
        setPassword('');
        setConfirmPassword('');
      },
      onError: (err) => {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      },
    });
  };

  return (
    <section className="flex flex-col gap-4 rounded-card-lg border border-border bg-surface p-6 shadow-[0px_4px_16px_0px_rgba(23,23,20,0.05)]">
      <h2 className="text-h3 font-bold text-text-primary">Sécurité</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextInput
          label="Nouveau mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <TextInput
          label="Confirmer le mot de passe"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={updatePassword.isPending}>
            {updatePassword.isPending ? 'Enregistrement…' : 'Mettre à jour le mot de passe'}
          </Button>
          <FieldStatus status={status} error={error} savedMessage="Mot de passe mis à jour." />
        </div>
      </form>
    </section>
  );
}
