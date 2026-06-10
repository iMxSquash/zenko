// import { supabase } from '@/lib/supabase/client';
// import { redirect } from '@tanstack/react-router';
import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected')({
  // beforeLoad: async () => {
  //   const {
  //     data: { user },
  //   } = await supabase.auth.getUser();
  //   if (!user) throw redirect({ to: '/login' });
  // },
  component: () => <Outlet />,
});
