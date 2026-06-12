import { useChatSessions } from '@/hooks/useAssistant';
import { Link, createFileRoute } from '@tanstack/react-router';
import { ArrowLeft, Plus } from 'lucide-react';

export const Route = createFileRoute('/_protected/_app/assistant/history')({
  component: AssistantHistoryPage,
});

function AssistantHistoryPage() {
  const { data: sessions, isLoading, error } = useChatSessions();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            to="/assistant"
            aria-label="Retour à l'assistant"
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:text-brand transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-sm font-semibold">Conversations</h1>
        </div>
        <Link
          to="/assistant"
          aria-label="Nouvelle conversation"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && <p className="text-sm text-text-muted">Chargement…</p>}
        {error && <p className="text-sm text-danger">Impossible de charger l&apos;historique.</p>}
        {!isLoading && sessions?.length === 0 && (
          <p className="text-sm text-text-muted">Aucune conversation pour l&apos;instant.</p>
        )}
        <ul className="space-y-2">
          {sessions?.map((s) => (
            <li key={s.id}>
              <Link
                to="/assistant/$sessionId"
                params={{ sessionId: s.id }}
                className="flex flex-col rounded-card border border-border px-4 py-3 hover:border-brand transition-colors"
              >
                <span className="text-sm font-medium">{s.title}</span>
                <span className="text-xs text-text-muted">
                  {new Date(s.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
