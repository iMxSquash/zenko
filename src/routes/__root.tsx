import { Outlet, createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  return (
    <>
      <a
        href="#main-content"
        className="fixed left-2 top-2 z-[9999] -translate-y-full rounded bg-brand px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
      >
        Passer au contenu principal
      </a>
      <Outlet />
    </>
  );
}
