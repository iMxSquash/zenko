import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { supabase } from '@/lib/supabase/client';
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: '/login' });

    const { data } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    // Redirige sans exposer que /admin existe
    if (!data) throw redirect({ to: '/bibliotheque' });
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
