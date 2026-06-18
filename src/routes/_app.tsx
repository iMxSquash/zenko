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
      <a
        href="#main-content"
        className="fixed left-2 top-2 z-[9999] -translate-y-full rounded bg-brand px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
      >
        Passer au contenu principal
      </a>
      <AppSidebar />

      <div className="relative flex-1 pt-14 lg:pt-0">
        {showBlob && <BlobBackground />}
        <main id="main-content" className="relative z-10 h-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
