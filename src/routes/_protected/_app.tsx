import { AppSidebar } from '@/components/layout/AppSidebar';
import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/_app')({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
