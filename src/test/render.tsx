import { QueryClient, QueryClientProvider, type QueryKey } from '@tanstack/react-query'
import { act, render, renderHook, type RenderHookOptions } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'

/** A fresh client per test: no retries, no shared cache between tests. */
export const createTestQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } } })

/** Puts placeholder data under each key, so invalidation can be observed. */
export function seed(client: QueryClient, ...keys: QueryKey[]) {
  for (const key of keys) client.setQueryData(key, { seeded: true })
}

/** Whether a mutation marked the cached query under `key` stale. */
export const isInvalidated = (client: QueryClient, key: QueryKey) => client.getQueryState(key)?.isInvalidated ?? false

/**
 * `renderHook` inside a QueryClientProvider. Pass `client` to inspect or seed
 * the cache (e.g. the app's module-level `queryClient` for session tests).
 */
export function renderQueryHook<Result, Props>(
  hook: (props: Props) => Result,
  { client = createTestQueryClient(), ...options }: { client?: QueryClient } & RenderHookOptions<Props> = {},
) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return { client, ...renderHook(hook, { wrapper, ...options }) }
}

/**
 * Renders a mutation hook, runs it once with `variables` and returns the
 * client, so a test can check what the mutation wrote to or invalidated in it.
 */
export async function runMutation<Variables>(
  client: QueryClient,
  hook: () => { mutateAsync: (variables: Variables) => Promise<unknown> },
  variables: Variables,
) {
  const { result } = renderQueryHook(hook, { client })
  await act(() => result.current.mutateAsync(variables))
  return client
}

/**
 * Renders a component or screen inside the providers the app has: a fresh QueryClient
 * and a MemoryRouter at `route`. Pass `client` to seed or inspect the cache.
 */
export function renderApp(ui: ReactNode, { route = '/', client = createTestQueryClient() }: { route?: string; client?: QueryClient } = {}) {
  return {
    client,
    ...render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </QueryClientProvider>,
    ),
  }
}
