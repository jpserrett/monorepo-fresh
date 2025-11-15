import { createRouterClient } from '@orpc/server'
import type { RouterClient } from '@orpc/server'
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { createIsomorphicFn } from '@tanstack/react-start'
import { router, type AppRouter } from '@repo/orpc-api'

const getORPCClient = createIsomorphicFn()
  .server(() => createRouterClient(router, {
    /**
     * Provide initial context if needed.
     *
     * Because this client instance is shared across all requests,
     * only include context that's safe to reuse globally.
     * For per-request context, use middleware context or pass a function as the initial context.
     */
    context: async () => ({
      headers: getRequestHeaders(), // provide headers if initial context required
    }),
  }))
  .client((): RouterClient<AppRouter> => {
    const link = new RPCLink({
      url: `${window.location.origin}/api/rpc`,
    })

    return createORPCClient(link)
  })

export const rpcClient: RouterClient<AppRouter> = getORPCClient()