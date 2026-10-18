import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { queryKeys } from '@/lib/queryKeys'
import { useAuthStore } from '@/stores/authStore'
import type { UserRole } from '@/types/api'
import { authUser, list, userProfile } from '@/test/factories'
import { isInvalidated, renderQueryHook, seed } from '@/test/render'
import { capture } from '@/test/server'
import { useApprove, useModerationQueue, useReject, useRequestChanges } from './useModeration'

function signInAs(role: UserRole) {
  useAuthStore.getState().setAuth(authUser())
  capture('get', '/api/user/me', userProfile({ role }))
}

describe('useModerationQueue', () => {
  it('stays idle for guests', () => {
    expect(renderQueryHook(() => useModerationQueue()).result.current.fetchStatus).toBe('idle')
  })

  it('stays idle for a regular user (the server would answer 403)', async () => {
    signInAs('user')
    const { result, client } = renderQueryHook(() => useModerationQueue())
    await waitFor(() => expect(client.getQueryData(queryKeys.me)).toBeDefined())
    expect(result.current.fetchStatus).toBe('idle')
  })

  it.each(['moderator', 'admin'] as const)('loads the queue for a %s', async (role) => {
    signInAs(role)
    const requests = capture('get', '/api/moderation/queue', list([]))
    const { result } = renderQueryHook(() => useModerationQueue({ kind: 'org' }))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(requests[0].query.get('kind')).toBe('org')
  })
})

describe('moderation decisions', () => {
  const orgKeys = [queryKeys.organisations.list(), queryKeys.countries.detail('c1'), queryKeys.corridors.stats('k1')]
  const peopleKey = queryKeys.people.list()

  it('approving an organisation refreshes the queue, organisations and place summaries', async () => {
    capture('post', '/api/moderation/approve', 'OK')
    const { result, client } = renderQueryHook(() => useApprove())
    seed(client, queryKeys.moderation.queue(), ...orgKeys, peopleKey)

    await act(() => result.current.mutateAsync({ kind: 'org', target_id: 'o1' }))

    expect(isInvalidated(client, queryKeys.moderation.queue())).toBe(true)
    for (const key of orgKeys) expect(isInvalidated(client, key), JSON.stringify(key)).toBe(true)
    expect(isInvalidated(client, peopleKey)).toBe(false)
  })

  it('rejecting a person refreshes the queue and people, not organisations', async () => {
    capture('post', '/api/moderation/reject', 'OK')
    const { result, client } = renderQueryHook(() => useReject())
    seed(client, queryKeys.moderation.queue(), ...orgKeys, peopleKey)

    await act(() => result.current.mutateAsync({ kind: 'person', target_id: 'p1' }))

    expect(isInvalidated(client, queryKeys.moderation.queue())).toBe(true)
    expect(isInvalidated(client, peopleKey)).toBe(true)
    for (const key of orgKeys) expect(isInvalidated(client, key), JSON.stringify(key)).toBe(false)
  })

  it('request-changes sends the note', async () => {
    const requests = capture('post', '/api/moderation/request-changes', 'OK')
    const { result } = renderQueryHook(() => useRequestChanges())

    await act(() => result.current.mutateAsync({ kind: 'org', target_id: 'o1', note: 'Add opening hours' }))

    expect(requests[0].body).toEqual({ kind: 'org', target_id: 'o1', note: 'Add opening hours' })
  })
})
