import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/forum/$threadId')({
  component: () => null,
})
