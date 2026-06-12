import { AdminForum } from '@/components/admin/AdminForum';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/forum/')({
  component: AdminForum,
});
