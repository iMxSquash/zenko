import { SourceList } from '@/components/assistant/SourceList';
import { useChatMessages } from '@/hooks/useAssistant';
import { cn } from '@/lib/utils';
import type { AssistantSource } from '@/types';
import { Link, createFileRoute } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

export const Route = createFileRoute('/_protected/assistant/$sessionId')({
  component: SessionReplayPage,
});

function SessionReplayPage() {
  const { sessionId } = Route.useParams();
  const { data: messages, isLoading, error } = useChatMessages(sessionId);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
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
            const isUser = m.role === 'user';
            const sources: AssistantSource[] = Array.isArray(m.sources) ? m.sources : [];

            return (
              <div key={m.id} className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[80%]', !isUser && 'w-full max-w-[80%]')}>
                  <div
                    className={cn(
                      'rounded-card px-4 py-2.5 text-sm leading-relaxed',
                      isUser ? 'bg-brand text-white' : 'bg-neutral-100 text-text-primary'
                    )}
                  >
                    {m.content}
                  </div>
                  {!isUser && <SourceList sources={sources} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
