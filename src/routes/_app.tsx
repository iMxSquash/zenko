import { AppSidebar } from '@/components/layout/AppSidebar';
import { BlobBackground } from '@/components/ui';
import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router';

export const Route = createFileRoute('/_app')({
  component: AppLayout,
});

const BLOB_ROUTES = ['/bibliotheque', '/forum', '/en-cours', '/favoris', '/profile'];

function AppLayout() {
  const { pathname } = useLocation();
  const showBlob = BLOB_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <main className="relative flex-1 overflow-y-auto pt-14 lg:pt-0">
        {showBlob && <BlobBackground />}
        <div className="relative z-10 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
