import type { FieldStatus as FieldStatusValue } from '@/hooks/useEditableField';

interface FieldStatusProps {
  status: FieldStatusValue;
  error?: string;
  savedMessage?: string;
}

export function FieldStatus({ status, error, savedMessage = 'Enregistré' }: FieldStatusProps) {
  if (status === 'saving') {
    return <p className="text-body-sm text-text-muted">Enregistrement…</p>;
  }

  if (status === 'saved') {
    return <p className="text-body-sm text-brand-green">{savedMessage}</p>;
  }

  if (status === 'error') {
    return <p className="text-body-sm text-danger">{error}</p>;
  }

  return null;
}
