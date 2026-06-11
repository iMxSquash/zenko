import type { AssistantSource } from '@/types';
import { Link } from '@tanstack/react-router';

interface SourceListProps {
  sources: AssistantSource[];
}

export function SourceList({ sources }: SourceListProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {sources.map((s) => (
        <SourceChip key={`${s.source_type}-${s.source_id}`} source={s} />
      ))}
    </div>
  );
}

function SourceChip({ source }: { source: AssistantSource }) {
  const label = source.source_type === 'fiche' ? `📄 ${source.title}` : `💬 ${source.title}`;

  const className =
    'rounded-full border border-border bg-neutral-100 px-2.5 py-0.5 text-xs text-text-muted hover:border-brand hover:text-brand transition-colors';

  if (source.source_type === 'fiche') {
    return (
      <Link to="/bibliotheque/$slug" params={{ slug: source.source_id }} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <Link to="/forum/$threadId" params={{ threadId: source.source_id }} className={className}>
      {label}
    </Link>
  );
}
