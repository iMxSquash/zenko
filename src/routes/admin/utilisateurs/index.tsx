import { AdminUtilisateurs } from '@/components/admin/AdminUtilisateurs';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/utilisateurs/')({
  component: AdminUtilisateurs,
});
