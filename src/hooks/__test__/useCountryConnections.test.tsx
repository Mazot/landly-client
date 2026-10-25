import type { QueryClient } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { queryKeys } from '@/lib/queryKeys'
import type { CountryConnection } from '@/types/api'
import { list } from '@/test/factories'
import { createTestQueryClient, isInvalidated, renderQueryHook, runMutation, seed } from '@/test/render'
import { capture } from '@/test/server'
import {
  useCountryConnection,
  useCountryConnections,
  useCreateCountryConnection,
  useDeleteCountryConnection,
  useUpdateCountryConnection,
} from '../useCountryConnections'

const connection: CountryConnection = {
  id: 'cc1',
  commonInfo: 'Consular hours Mon–Fri',
  consulateOrgId: null,
  embassyOrgId: 'o1',
  locationCountryId: 'c1',
}

describe('country connection queries', () => {
  it('lists connections with filters', async () => {
    const requests = capture('get', '/api/country-connection/list', list([connection]))
    const { result } = renderQueryHook(() => useCountryConnections({ location_country_id: 'c1' }))
    await waitFor(() => expect(result.current.data?.items).toEqual([connection]))
    expect(requests[0].query.get('location_country_id')).toBe('c1')
  })

  it('fetches one connection only with an id', async () => {
    expect(renderQueryHook(() => useCountryConnection(undefined)).result.current.fetchStatus).toBe('idle')
    capture('get', '/api/country-connection/fetch/cc1', connection)
    const { result } = renderQueryHook(() => useCountryConnection('cc1'))
    await waitFor(() => expect(result.current.data).toEqual(connection))
  })
})

describe('country connection writes (admin)', () => {
  it.each([
    ['create', 'post', '/api/country-connection/create', (c: QueryClient) => runMutation(c, useCreateCountryConnection, { common_info: 'x' })],
    ['update', 'put', '/api/country-connection/update/cc1', (c: QueryClient) => runMutation(c, useUpdateCountryConnection, { id: 'cc1', body: { common_info: 'y' } })],
    ['delete', 'delete', '/api/country-connection/delete/cc1', (c: QueryClient) => runMutation(c, useDeleteCountryConnection, 'cc1')],
  ] as const)('%s refreshes every connection query', async (_, method, path, run) => {
    capture(method, path, connection)
    const client = createTestQueryClient()
    seed(client, queryKeys.countryConnections.list(), queryKeys.countryConnections.detail('cc1'))

    await run(client)

    expect(isInvalidated(client, queryKeys.countryConnections.list())).toBe(true)
    expect(isInvalidated(client, queryKeys.countryConnections.detail('cc1'))).toBe(true)
  })
})
