import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { queryKeys } from '@/lib/queryKeys'
import type { ClaimPreview } from '@/types/api'
import { list, person } from '@/test/factories'
import { isInvalidated, renderQueryHook, seed } from '@/test/render'
import { capture } from '@/test/server'
import {
  useClaim,
  useConfirmClaim,
  useCreatePerson,
  useDeclineClaim,
  usePeople,
  usePerson,
  useVouchPerson,
} from './usePeople'

const preview: ClaimPreview = {
  name: 'Daria K.',
  status: 'awaiting',
  bio: null,
  city: 'Berlin',
  skills: ['Housing'],
  email: 'd@x.io',
  whatsapp: null,
  showCity: true,
  showEmail: false,
  showWhatsapp: false,
  allowReviews: true,
}

describe('people queries', () => {
  it('lists public people with comma-separated filters', async () => {
    const p = person()
    const requests = capture('get', '/api/person/list', list([p]))
    const { result } = renderQueryHook(() => usePeople({ skills: ['Housing', 'Language'] }))
    await waitFor(() => expect(result.current.data?.items).toEqual([p]))
    expect(requests[0].query.get('skills')).toBe('Housing,Language')
  })

  it('fetches a person only with an id', async () => {
    expect(renderQueryHook(() => usePerson(undefined)).result.current.fetchStatus).toBe('idle')
    const p = person({ id: 'p1' })
    capture('get', '/api/person/fetch/p1', p)
    const { result } = renderQueryHook(() => usePerson('p1'))
    await waitFor(() => expect(result.current.data).toEqual(p))
  })
})

describe('people writes', () => {
  it('create refreshes every people query and returns the claim link', async () => {
    const created = { person: person({ status: 'pending' }), claimUrl: '/claim/tok', sendVia: 'email' }
    capture('post', '/api/person/create', created)
    const { result, client } = renderQueryHook(() => useCreatePerson())
    seed(client, queryKeys.people.list())

    let answer: unknown
    await act(async () => {
      answer = await result.current.mutateAsync({ name: 'Daria K.', consent_given: true, email: 'd@x.io' })
    })

    expect(answer).toEqual(created)
    expect(isInvalidated(client, queryKeys.people.list())).toBe(true)
  })

  it('vouch stores the fresh person and refreshes lists (they carry `vouches`)', async () => {
    const vouched = person({ id: 'p1', vouches: 3 })
    capture('post', '/api/person/vouch/p1', vouched)
    const { result, client } = renderQueryHook(() => useVouchPerson())
    seed(client, queryKeys.people.list({ city: 'Berlin' }), queryKeys.people.claim('tok'))

    await act(() => result.current.mutateAsync({ id: 'p1' }))

    expect(client.getQueryData(queryKeys.people.detail('p1'))).toEqual(vouched)
    expect(isInvalidated(client, queryKeys.people.list({ city: 'Berlin' }))).toBe(true)
    expect(isInvalidated(client, queryKeys.people.claim('tok'))).toBe(false)
  })
})

describe('claim flow', () => {
  it('useClaim stays idle without a token', () => {
    expect(renderQueryHook(() => useClaim(undefined)).result.current.fetchStatus).toBe('idle')
  })

  it('useClaim loads the preview for the token holder', async () => {
    capture('get', '/api/person/claim/tok', preview)
    const { result } = renderQueryHook(() => useClaim('tok'))
    await waitFor(() => expect(result.current.data).toEqual(preview))
  })

  it('useClaim does not retry an invalid token', async () => {
    const requests = capture('get', '/api/person/claim/bad', { error: 'not found' }, 404)
    const { result, client } = renderQueryHook(() => useClaim('bad'))
    client.setDefaultOptions({ queries: { retry: 3 } })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(requests).toHaveLength(1)
  })

  it('useConfirmClaim stores the confirmed preview and refreshes people', async () => {
    const confirmed = { ...preview, status: 'confirmed' as const, showEmail: true }
    const requests = capture('post', '/api/person/claim/tok/confirm', confirmed)
    const { result, client } = renderQueryHook(() => useConfirmClaim('tok'))
    seed(client, queryKeys.people.list())

    await act(() => result.current.mutateAsync({ show_email: true }))

    expect(requests[0].body).toEqual({ show_email: true })
    expect(client.getQueryData(queryKeys.people.claim('tok'))).toEqual(confirmed)
    expect(isInvalidated(client, queryKeys.people.list())).toBe(true)
  })

  it('useDeclineClaim refreshes the claim preview', async () => {
    capture('post', '/api/person/claim/tok/decline', 'OK')
    const { result, client } = renderQueryHook(() => useDeclineClaim('tok'))
    seed(client, queryKeys.people.claim('tok'))

    await act(() => result.current.mutateAsync())

    expect(isInvalidated(client, queryKeys.people.claim('tok'))).toBe(true)
  })
})
