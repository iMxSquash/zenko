import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <h1 className="text-2xl font-semibold text-brand">Zenko</h1>
    </main>
  )
}
