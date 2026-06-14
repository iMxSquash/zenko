import { ThreadDetail } from '@/components/forum/ThreadDetail';
import { SEOHead } from '@/components/seo/SEOHead';
import { useForumThread } from '@/hooks/useForum';
import {
  generateBreadcrumbJsonLd,
  generateDiscussionForumPostingJsonLd,
  useJsonLd,
} from '@/lib/seo/jsonld';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/forum/$threadId')({
  component: ThreadDetailPage,
});

function ThreadDetailPage() {
  const { threadId } = Route.useParams();
  const { data: thread } = useForumThread(threadId);

  useJsonLd(thread ? generateDiscussionForumPostingJsonLd(thread) : null, 'thread-jsonld');
  useJsonLd(
    thread
      ? generateBreadcrumbJsonLd([
          { name: 'Forum', path: '/forum' },
          { name: thread.title, path: `/forum/${threadId}` },
        ])
      : null,
    'thread-breadcrumb-jsonld'
  );

  return (
    <>
      <SEOHead
        title={thread?.title ?? 'Discussion'}
        description={thread?.content.slice(0, 160)}
        path={`/forum/${threadId}`}
        noIndex={!thread}
      />
      <ThreadDetail threadId={threadId} />
    </>
  );
}
