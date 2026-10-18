import type { QueryClient } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { queryKeys } from '@/lib/queryKeys'
import { list, review } from '@/test/factories'
import { createTestQueryClient, isInvalidated, renderQueryHook, runMutation, seed } from '@/test/render'
import { capture } from '@/test/server'
import { useCreateReview, useDeleteReview, useReviews } from './useReviews'

describe('useReviews', () => {
  it('stays idle without a target', () => {
    expect(renderQueryHook(() => useReviews(undefined)).result.current.fetchStatus).toBe('idle')
  })

  it('lists the reviews of one target', async () => {
    const r = review({ organisationId: 'o1' })
    const requests = capture('get', '/api/review/list', list([r]))
    const { result } = renderQueryHook(() => useReviews({ organisation_id: 'o1' }))
    await waitFor(() => expect(result.current.data?.items).toEqual([r]))
    expect(requests[0].query.get('organisation_id')).toBe('o1')
  })
})

describe('review writes', () => {
  it.each([
    ['create', 'post', '/api/review/create', (c: QueryClient) => runMutation(c, useCreateReview, { organisation_id: 'o1', rating: 4 })],
    ['delete', 'delete', '/api/review/delete/r1', (c: QueryClient) => runMutation(c, useDeleteReview, 'r1')],
  ] as const)('%s refreshes reviews and the target ratings', async (_, method, path, run) => {
    capture(method, path, review())
    const client = createTestQueryClient()
    const keys = [queryKeys.reviews.list({ organisation_id: 'o1' }), queryKeys.organisations.detail('o1'), queryKeys.people.detail('p1')]
    seed(client, ...keys)

    await run(client)

    for (const key of keys) expect(isInvalidated(client, key), JSON.stringify(key)).toBe(true)
  })
})
