import { Forum } from '@/components/forum/Forum';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/forum/')({
  component: Forum,
});
