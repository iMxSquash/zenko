import { AdminFiches } from '@/components/admin/AdminFiches';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/fiches/')({
  component: AdminFiches,
});
