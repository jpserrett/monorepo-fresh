import { RPCHandler } from '@orpc/server/fetch'
import { createFileRoute } from '@tanstack/react-router'
import { router } from '@repo/orpc-api'

const handler = new RPCHandler(router, {
  // Add interceptors if needed for logging/error handling
})

export const Route = createFileRoute('/api/rpc/$')({
  server: {
    handlers: {
      ANY: async ({ request }) => {
        const { response } = await handler.handle(request, {
          prefix: '/api/rpc',
          context: {}, // Initial context - can add request headers, etc.
        })

        return response ?? new Response('Not Found', { status: 404 })
      },
    },
  },
})