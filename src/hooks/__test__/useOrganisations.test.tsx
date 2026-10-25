import type { QueryClient } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { http, HttpResponse, delay } from 'msw'
import { describe, expect, it } from 'vitest'
import { queryKeys } from '@/lib/queryKeys'
import type { SearchOrganisationsQuery } from '@/types/api'
import { list, organisation } from '@/test/factories'
import { createTestQueryClient, isInvalidated, renderQueryHook, runMutation, seed } from '@/test/render'
import { API, capture, server } from '@/test/server'
import {
  useCheckin,
  useCreateOrganisation,
  useDeleteOrganisation,
  useOrganisation,
  useOrganisations,
  useRecordVisit,
  useSearchOrganisations,
  useUpdateOrganisation,
} from '../useOrganisations'

describe('useOrganisations', () => {
  it('loads a filtered list', async () => {
    const org = organisation()
    const requests = capture('get', '/api/organisation/list', list([org]))
    const { result } = renderQueryHook(() => useOrganisations({ name: 'emb' }))
    await waitFor(() => expect(result.current.data?.items).toEqual([org]))
    expect(requests[0].query.get('name')).toBe('emb')
  })
})

describe('useSearchOrganisations', () => {
  it('stays idle until the map knows its bounds', () => {
    const { result } = renderQueryHook(() => useSearchOrganisations(undefined))
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('keeps the previous results on screen while the next viewport loads', async () => {
    const first = organisation({ name: 'First' })
    server.use(
      http.get(`${API}/api/organisation/search`, async ({ request }) => {
        const lat = new URL(request.url).searchParams.get('lat')
        if (lat === '2') await delay(50)
        return HttpResponse.json(list([lat === '1' ? first : organisation({ name: 'Second' })]))
      }),
    )
    const { result, rerender } = renderQueryHook((q: SearchOrganisationsQuery) => useSearchOrganisations(q), {
      initialProps: { lat: 1, lng: 1 },
    })
    await waitFor(() => expect(result.current.data?.items[0].name).toBe('First'))

    rerender({ lat: 2, lng: 2 })

    expect(result.current.isPlaceholderData).toBe(true)
    expect(result.current.data?.items[0].name).toBe('First')
    await waitFor(() => expect(result.current.data?.items[0].name).toBe('Second'))
  })
})

describe('useOrganisation', () => {
  it('stays idle without an id and loads the detail with one', async () => {
    expect(renderQueryHook(() => useOrganisation(undefined)).result.current.fetchStatus).toBe('idle')

    const org = organisation({ id: 'o1', community: { peopleCame: 2, stillActivePct: 100, lastCheckinAt: null, tips: [] } })
    capture('get', '/api/organisation/fetch/o1', org)
    const { result } = renderQueryHook(() => useOrganisation('o1'))
    await waitFor(() => expect(result.current.data).toEqual(org))
  })
})

describe('organisation writes', () => {
  const affected = [
    queryKeys.organisations.list(),
    queryKeys.organisations.detail('o1'),
    queryKeys.me,
    queryKeys.countries.detail('c1'),
    queryKeys.corridors.stats('k1'),
  ]

  it.each([
    ['create', 'post', '/api/organisation/create', (c: QueryClient) => runMutation(c, useCreateOrganisation, { name: 'New' })],
    ['update', 'put', '/api/organisation/update/o1', (c: QueryClient) => runMutation(c, useUpdateOrganisation, { id: 'o1', body: { name: 'Renamed' } })],
    ['delete', 'delete', '/api/organisation/delete/o1', (c: QueryClient) => runMutation(c, useDeleteOrganisation, 'o1')],
  ] as const)('%s refreshes lists, the creator stats and place summaries', async (_, method, path, run) => {
    capture(method, path, organisation({ id: 'o1' }))
    const client = createTestQueryClient()
    seed(client, ...affected, queryKeys.countries.list())

    await run(client)

    for (const key of affected) expect(isInvalidated(client, key), JSON.stringify(key)).toBe(true)
    expect(isInvalidated(client, queryKeys.countries.list())).toBe(false)
  })
})

describe('useCheckin', () => {
  it('replaces the cached detail with the fresh payload', async () => {
    const fresh = organisation({ id: 'o1', community: { peopleCame: 5, stillActivePct: 80, lastCheckinAt: null, tips: ['Bring a photo'] } })
    const requests = capture('post', '/api/organisation/checkin/o1', fresh)
    const { result, client } = renderQueryHook(() => useCheckin())

    await act(() => result.current.mutateAsync({ id: 'o1', body: { tip: 'Bring a photo' } }))

    expect(requests[0].body).toEqual({ tip: 'Bring a photo' })
    expect(client.getQueryData(queryKeys.organisations.detail('o1'))).toEqual(fresh)
  })
})

describe('useRecordVisit', () => {
  it('patches visitsCount of the cached detail', async () => {
    capture('post', '/api/organisation/visit/o1', { visitsCount: 8 })
    const { result, client } = renderQueryHook(() => useRecordVisit())
    client.setQueryData(queryKeys.organisations.detail('o1'), organisation({ id: 'o1', visitsCount: 7 }))

    await act(() => result.current.mutateAsync('o1'))

    expect(client.getQueryData<{ visitsCount: number }>(queryKeys.organisations.detail('o1'))?.visitsCount).toBe(8)
  })

  it('does not invent a detail that was never loaded', async () => {
    capture('post', '/api/organisation/visit/o2', { visitsCount: 1 })
    const { result, client } = renderQueryHook(() => useRecordVisit())

    await act(() => result.current.mutateAsync('o2'))

    expect(client.getQueryData(queryKeys.organisations.detail('o2'))).toBeUndefined()
  })
})
