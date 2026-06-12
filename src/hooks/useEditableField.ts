import { useEffect, useState } from 'react';

export type FieldStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useEditableField(value: string, onSave: (value: string) => Promise<void>) {
  const [draft, setDraft] = useState(value);
  const [status, setStatus] = useState<FieldStatus>('idle');
  const [error, setError] = useState<string>();

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = async () => {
    if (draft === value) return;

    setStatus('saving');
    setError(undefined);
    try {
      await onSave(draft);
      setStatus('saved');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    }
  };

  return { draft, setDraft, status, error, commit };
}
