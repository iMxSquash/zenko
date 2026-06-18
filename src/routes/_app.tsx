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
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-9999 focus:rounded focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Passer au contenu principal
      </a>
      <AppSidebar />

      <div className="relative flex-1 overflow-hidden pt-14 lg:pt-0">
        {showBlob && <BlobBackground />}
        <main
          id="main-content"
          tabIndex={-1}
          className="relative z-10 h-full overflow-y-auto outline-none"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
