import { describe, expect, it } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { authUser } from '@/test/factories'
import { createTestQueryClient } from '@/test/render'
import { invalidatePlaceSummaries } from '../invalidation'
import { queryClient } from '../queryClient'
import { queryKeys } from '../queryKeys'
import { endSession, startSession } from '../session'

describe('session', () => {
  it('startSession drops the previous cache and stores the new session', () => {
    queryClient.setQueryData(queryKeys.me, { role: 'admin' })

    startSession(authUser({ username: 'new', token: 't2' }))

    expect(queryClient.getQueryData(queryKeys.me)).toBeUndefined()
    expect(useAuthStore.getState()).toMatchObject({ token: 't2', isAuthenticated: true, user: { username: 'new' } })
  })

  it('endSession clears the session and every cached query', () => {
    startSession(authUser())
    queryClient.setQueryData(queryKeys.saved.counts, { total: 3 })

    endSession()

    expect(useAuthStore.getState()).toMatchObject({ token: null, user: null, isAuthenticated: false })
    expect(queryClient.getQueryData(queryKeys.saved.counts)).toBeUndefined()
  })
})

describe('queryClient', () => {
  it('uses the app defaults', () => {
    expect(queryClient.getDefaultOptions().queries).toMatchObject({
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    })
  })
})

describe('invalidatePlaceSummaries', () => {
  it('invalidates country details and corridor stats, but not country lists', () => {
    const client = createTestQueryClient()
    client.setQueryData(queryKeys.countries.detail('c1'), {})
    client.setQueryData(queryKeys.corridors.stats('k1'), {})
    client.setQueryData(queryKeys.countries.list(), [])

    invalidatePlaceSummaries(client)

    const state = (key: readonly unknown[]) => client.getQueryState(key)?.isInvalidated
    expect(state(queryKeys.countries.detail('c1'))).toBe(true)
    expect(state(queryKeys.corridors.stats('k1'))).toBe(true)
    expect(state(queryKeys.countries.list())).toBe(false)
  })
})
