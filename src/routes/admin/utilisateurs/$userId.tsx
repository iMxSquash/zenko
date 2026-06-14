import { AdminUserDetail } from '@/components/admin/AdminUserDetail';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/utilisateurs/$userId')({
  component: AdminUserDetailPage,
});

function AdminUserDetailPage() {
  const { userId } = Route.useParams();
  return <AdminUserDetail userId={userId} />;
}
