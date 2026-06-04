import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/assistant/$sessionId')({
  component: () => null,
})
