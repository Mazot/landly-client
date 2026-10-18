import type { QueryClient } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { queryKeys } from '@/lib/queryKeys'
import { useAuthStore } from '@/stores/authStore'
import { authUser, corridor, list } from '@/test/factories'
import { createTestQueryClient, isInvalidated, renderQueryHook, runMutation, seed } from '@/test/render'
import { capture } from '@/test/server'
import { useCorridorStats, useCorridors, useCreateCorridor, useDeleteCorridor, useSetDefaultCorridor } from './useCorridors'

const signIn = () => useAuthStore.getState().setAuth(authUser())

describe('useCorridors', () => {
  it('stays idle for guests (they use corridorStore)', () => {
    const { result } = renderQueryHook(() => useCorridors())
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('loads the caller’s corridors when signed in', async () => {
    signIn()
    const own = corridor({ isDefault: true })
    capture('get', '/api/corridor/list', list([own]))
    const { result } = renderQueryHook(() => useCorridors())
    await waitFor(() => expect(result.current.data?.items).toEqual([own]))
  })
})

describe('useCorridorStats', () => {
  it('needs both a session and an id', () => {
    expect(renderQueryHook(() => useCorridorStats('k1')).result.current.fetchStatus).toBe('idle')
    signIn()
    expect(renderQueryHook(() => useCorridorStats(undefined)).result.current.fetchStatus).toBe('idle')
  })

  it('loads the stats when signed in', async () => {
    signIn()
    const stats = { corridorId: 'k1', fromCountryId: 'a', toCountryId: 'b', totalPlaces: 4, newThisWeek: 1, byType: [] }
    capture('get', '/api/corridor/stats/k1', stats)
    const { result } = renderQueryHook(() => useCorridorStats('k1'))
    await waitFor(() => expect(result.current.data).toEqual(stats))
  })
})

describe('corridor writes', () => {
  it.each([
    ['create', 'post', '/api/corridor/create', (c: QueryClient) => runMutation(c, useCreateCorridor, { from_country_id: 'a', to_country_id: 'b' })],
    ['set-default', 'put', '/api/corridor/set-default/k1', (c: QueryClient) => runMutation(c, useSetDefaultCorridor, 'k1')],
    ['delete', 'delete', '/api/corridor/delete/k1', (c: QueryClient) => runMutation(c, useDeleteCorridor, 'k1')],
  ] as const)('%s refreshes the list and stats', async (_, method, path, run) => {
    capture(method, path, corridor())
    const client = createTestQueryClient()
    seed(client, queryKeys.corridors.list, queryKeys.corridors.stats('k1'))

    await run(client)

    expect(isInvalidated(client, queryKeys.corridors.list)).toBe(true)
    expect(isInvalidated(client, queryKeys.corridors.stats('k1'))).toBe(true)
  })
})
