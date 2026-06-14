import { AdminAvatars } from '@/components/admin/AdminAvatars';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/avatars/')({
  component: AdminAvatars,
});
