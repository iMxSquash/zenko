import { Info, X } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'zenko_chat_notice_dismissed';

export function ChatNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <output className="flex items-start gap-3 border-b border-border bg-brand/5 px-4 py-3 text-sm text-text-secondary">
      <Info size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
      <p className="flex-1 leading-5">
        Vos conversations sont <strong>privées</strong> et supprimées après 12 mois. Les messages
        sont transmis à Google Gemini pour générer les réponses, n'incluez pas de données médicales
        nominatives (nom de l'enfant, numéro de dossier).
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Fermer cette notice"
        className="shrink-0 rounded p-0.5 text-text-muted hover:text-text-primary transition-colors"
      >
        <X size={14} />
      </button>
    </output>
  );
}
