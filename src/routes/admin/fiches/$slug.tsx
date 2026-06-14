import { AdminFicheEdit } from '@/components/admin/AdminFicheEdit';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/fiches/$slug')({
  component: AdminFicheEditPage,
});

function AdminFicheEditPage() {
  const { slug } = Route.useParams();
  return <AdminFicheEdit slug={slug} />;
}
