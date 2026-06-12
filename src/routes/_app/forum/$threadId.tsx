import { ThreadDetail } from '@/components/forum/ThreadDetail';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/forum/$threadId')({
  component: ThreadDetailPage,
});

function ThreadDetailPage() {
  const { threadId } = Route.useParams();
  return <ThreadDetail threadId={threadId} />;
}
