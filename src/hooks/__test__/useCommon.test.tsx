import { act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { queryKeys } from '@/lib/queryKeys'
import { country } from '@/test/factories'
import { isInvalidated, renderQueryHook, seed } from '@/test/render'
import { API, capture, server } from '@/test/server'
import {
  useAllCountries,
  useCountries,
  useCountriesInfinite,
  useCountry,
  useCreateOrganisationType,
  useLanguages,
  useOrganisationTypes,
} from '../useCommon'

describe('useCountries', () => {
  it('loads the country list with the query', async () => {
    const germany = country()
    const requests = capture('get', '/api/common/countries', [germany])

    const { result } = renderQueryHook(() => useCountries({ name: 'ger' }))

    await waitFor(() => expect(result.current.data).toEqual([germany]))
    expect(requests[0].query.get('name')).toBe('ger')
  })
})

describe('useAllCountries', () => {
  it('loads a short table in one request, sorted by name', async () => {
    const requests = capture('get', '/api/common/countries', [country({ name: 'Poland' }), country({ name: 'Germany' })])

    const { result } = renderQueryHook(() => useAllCountries())

    await waitFor(() => expect(result.current.data?.map((c) => c.name)).toEqual(['Germany', 'Poland']))
    expect(requests).toHaveLength(1)
    expect(Object.fromEntries(requests[0].query)).toEqual({ limit: '150', offset: '0', brief: 'true' })
  })

  it('asks for the rest from the server offset cap (150) when the first page is full', async () => {
    const asked: { offset: string | null; limit: string | null; brief: string | null }[] = []
    server.use(
      http.get(`${API}/api/common/countries`, ({ request }) => {
        const q = new URL(request.url).searchParams
        asked.push({ offset: q.get('offset'), limit: q.get('limit'), brief: q.get('brief') })
        const size = q.get('offset') === '0' ? 150 : 12
        return HttpResponse.json(Array.from({ length: size }, () => country()))
      }),
    )

    const { result } = renderQueryHook(() => useAllCountries())

    await waitFor(() => expect(result.current.data).toHaveLength(162))
    expect(asked).toEqual([
      { offset: '0', limit: '150', brief: 'true' },
      { offset: '150', limit: '250', brief: 'true' },
    ])
  })
})

describe('useCountriesInfinite', () => {
  /** Answers as many countries as asked for, like a large table would. */
  function fullPages() {
    const asked: { offset: string | null; limit: string | null; brief: string | null }[] = []
    server.use(
      http.get(`${API}/api/common/countries`, ({ request }) => {
        const q = new URL(request.url).searchParams
        asked.push({ offset: q.get('offset'), limit: q.get('limit'), brief: q.get('brief') })
        return HttpResponse.json(Array.from({ length: Number(q.get('limit')) }, () => country()))
      }),
    )
    return asked
  }

  it('pages by 50 up to the server offset cap (150), then asks once for the max limit', async () => {
    const asked = fullPages()
    const { result } = renderQueryHook(() => useCountriesInfinite(''))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Not wrapped in act(): with React 19 the observer update scheduled inside
    // act() never reaches the hook; waitFor() is TanStack's documented pattern.
    for (let page = 2; page <= 4; page++) {
      void result.current.fetchNextPage()
      await waitFor(() => expect(result.current.data?.pages).toHaveLength(page))
    }

    expect(asked).toEqual([
      { offset: '0', limit: '50', brief: 'true' },
      { offset: '50', limit: '50', brief: 'true' },
      { offset: '100', limit: '50', brief: 'true' },
      { offset: '150', limit: '250', brief: 'true' },
    ])
    await waitFor(() => expect(result.current.hasNextPage).toBe(false))
    expect(result.current.data?.pageParams).toEqual([0, 50, 100, 150])
  })

  it('stops after a short page and sends the name filter', async () => {
    const requests = capture('get', '/api/common/countries', [country(), country()])
    const { result } = renderQueryHook(() => useCountriesInfinite('ger'))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.hasNextPage).toBe(false)
    expect(requests[0].query.get('name')).toBe('ger')
  })

  it('omits an empty name', async () => {
    const requests = capture('get', '/api/common/countries', [])
    const { result } = renderQueryHook(() => useCountriesInfinite(''))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(requests[0].query.has('name')).toBe(false)
  })
})

describe('useCountry', () => {
  it('stays idle without an id', () => {
    const { result } = renderQueryHook(() => useCountry(undefined))
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('loads the country detail', async () => {
    const detail = { ...country({ id: 'c1' }), totalPlaces: 3, placesByType: [{ slug: 'embassy', count: 3 }] }
    capture('get', '/api/common/countries/c1', detail)
    const { result } = renderQueryHook(() => useCountry('c1'))
    await waitFor(() => expect(result.current.data).toEqual(detail))
  })
})

describe('useOrganisationTypes', () => {
  it('loads the org types', async () => {
    const types = [{ id: 't1', type: 'embassy', slug: 'embassy', title: 'Embassy', color: '#4A6D8C' }]
    capture('get', '/api/common/org_types', types)
    const { result } = renderQueryHook(() => useOrganisationTypes())
    await waitFor(() => expect(result.current.data).toEqual(types))
  })
})

describe('useLanguages', () => {
  it('asks for the whole table (limit 500) by default', async () => {
    const requests = capture('get', '/api/common/languages', [{ id: 'l1', name: 'Russian', symbol: 'ru' }])
    const { result } = renderQueryHook(() => useLanguages())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(Object.fromEntries(requests[0].query)).toEqual({ limit: '500' })
  })

  it('passes a custom query through', async () => {
    const requests = capture('get', '/api/common/languages', [])
    const { result } = renderQueryHook(() => useLanguages({ name: 'rus' }))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(Object.fromEntries(requests[0].query)).toEqual({ name: 'rus' })
  })
})

describe('useCreateOrganisationType', () => {
  it('invalidates the org types after creating one', async () => {
    capture('post', '/api/common/org_types', { id: 't2' })
    const { result, client } = renderQueryHook(() => useCreateOrganisationType())
    seed(client, queryKeys.organisationTypes)

    await act(() => result.current.mutateAsync({ org_type: 'helper', title: 'Helper', color: '#4F7F5C' }))

    expect(isInvalidated(client, queryKeys.organisationTypes)).toBe(true)
  })
})
