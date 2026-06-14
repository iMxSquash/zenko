import { AdminFicheNouvelle } from '@/components/admin/AdminFicheNouvelle';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/fiches/nouvelle')({
  component: AdminFicheNouvelle,
});
