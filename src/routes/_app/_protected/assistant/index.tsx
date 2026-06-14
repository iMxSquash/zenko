import { ChatAssistant } from '@/components/assistant/ChatAssistant';
import { Link, createFileRoute } from '@tanstack/react-router';
import { History } from 'lucide-react';

export const Route = createFileRoute('/_app/_protected/assistant/')({
  component: AssistantPage,
});

function AssistantPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h1 className="text-sm font-semibold">Assistant</h1>
        <Link
          to="/assistant/history"
          aria-label="Historique des conversations"
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:text-brand transition-colors"
        >
          <History size={18} />
        </Link>
      </div>
      <ChatAssistant />
    </div>
  );
}
