import type { QueryClient } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { queryKeys } from '@/lib/queryKeys'
import { useAuthStore } from '@/stores/authStore'
import { authUser, list, savedItem } from '@/test/factories'
import { createTestQueryClient, isInvalidated, renderQueryHook, runMutation, seed } from '@/test/render'
import { capture } from '@/test/server'
import { useDeleteSavedItem, useSaveItem, useSavedCounts, useSavedItems } from './useSaved'
import { useCreateReport } from './useReports'

describe('saved queries', () => {
  it('stay idle for guests', () => {
    expect(renderQueryHook(() => useSavedItems()).result.current.fetchStatus).toBe('idle')
    expect(renderQueryHook(() => useSavedCounts()).result.current.fetchStatus).toBe('idle')
  })

  it('load the caller’s items and counts when signed in', async () => {
    useAuthStore.getState().setAuth(authUser())
    const item = savedItem()
    const counts = { total: 1, org: 1, person: 0, country: 0, corridor: 0 }
    const requests = capture('get', '/api/saved/list', list([item]))
    capture('get', '/api/saved/counts', counts)

    const items = renderQueryHook(() => useSavedItems({ kind: 'org' })).result
    const totals = renderQueryHook(() => useSavedCounts()).result

    await waitFor(() => expect(items.current.data?.items).toEqual([item]))
    await waitFor(() => expect(totals.current.data).toEqual(counts))
    expect(requests[0].query.get('kind')).toBe('org')
  })
})

describe('saved writes', () => {
  it.each([
    ['save', 'post', '/api/saved/create', (c: QueryClient) => runMutation(c, useSaveItem, { kind: 'org', target_id: 'o1' })],
    ['delete', 'delete', '/api/saved/delete/s1', (c: QueryClient) => runMutation(c, useDeleteSavedItem, 's1')],
  ] as const)('%s refreshes items and counts', async (_, method, path, run) => {
    capture(method, path, savedItem())
    const client = createTestQueryClient()
    seed(client, queryKeys.saved.list(), queryKeys.saved.counts)

    await run(client)

    expect(isInvalidated(client, queryKeys.saved.list())).toBe(true)
    expect(isInvalidated(client, queryKeys.saved.counts)).toBe(true)
  })
})

describe('useCreateReport', () => {
  it('refreshes the moderation queue (it counts open reports)', async () => {
    const requests = capture('post', '/api/report/create', { id: 'r1' })
    const { result, client } = renderQueryHook(() => useCreateReport())
    seed(client, queryKeys.moderation.queue())

    await act(() => result.current.mutateAsync({ target_kind: 'org', target_id: 'o1', reason: 'Closed' }))

    expect(requests[0].body).toEqual({ target_kind: 'org', target_id: 'o1', reason: 'Closed' })
    expect(isInvalidated(client, queryKeys.moderation.queue())).toBe(true)
  })
})
