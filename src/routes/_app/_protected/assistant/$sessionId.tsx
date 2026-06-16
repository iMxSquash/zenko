import { MessageBubble } from '@/components/assistant/MessageBubble';
import { useChatMessages } from '@/hooks/useAssistant';
import type { AssistantSource } from '@/types';
import { ArrowLeft } from '@phosphor-icons/react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_protected/assistant/$sessionId')({
  component: SessionReplayPage,
});

function SessionReplayPage() {
  const { sessionId } = Route.useParams();
  const { data: messages, isLoading, error } = useChatMessages(sessionId);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Link
          to="/assistant/history"
          aria-label="Retour à l'historique"
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:text-brand transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-sm font-semibold">Conversation</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {isLoading && <p className="text-sm text-text-muted">Chargement…</p>}
        {error && <p className="text-sm text-danger">Impossible de charger cette session.</p>}
        <div className="flex flex-col gap-4">
          {messages?.map((m) => {
            const sources: AssistantSource[] = Array.isArray(m.sources) ? m.sources : [];

            return <MessageBubble key={m.id} role={m.role} content={m.content} sources={sources} />;
          })}
        </div>
      </div>
    </div>
  );
}
