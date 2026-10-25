import { act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { queryClient } from '@/lib/queryClient'
import { queryKeys } from '@/lib/queryKeys'
import { useAuthStore } from '@/stores/authStore'
import { authUser } from '@/test/factories'
import { renderQueryHook, runMutation } from '@/test/render'
import { capture } from '@/test/server'
import { useGoogleExchange, useSignIn, useSignOut, useSignUp } from '../useAuth'

// Session hooks act on the app's module-level queryClient (lib/session.ts).
const render = <T,>(hook: () => T) => renderQueryHook(hook, { client: queryClient })

describe('session hooks', () => {
  const signIn = { email: 'd@x.io', password: 'secret123' }
  const signUp = { username: 'daria', email: 'd@x.io', password: 'secret123' }
  const exchange = { code: 'one-time' }

  it.each([
    ['useSignIn', '/api/user/signin', signIn, () => runMutation(queryClient, useSignIn, signIn)],
    ['useSignUp', '/api/user/signup', signUp, () => runMutation(queryClient, useSignUp, signUp)],
    ['useGoogleExchange', '/api/user/oauth/google/exchange', exchange, () => runMutation(queryClient, useGoogleExchange, exchange)],
  ] as const)('%s starts a session and drops the previous account’s cache', async (_, path, body, run) => {
    const user = authUser({ username: 'daria', token: 'fresh' })
    const requests = capture('post', path, user)
    queryClient.setQueryData(queryKeys.me, { role: 'admin' })

    await run()

    expect(requests[0].body).toEqual(body)
    expect(useAuthStore.getState()).toMatchObject({ token: 'fresh', isAuthenticated: true, user: { username: 'daria' } })
    expect(queryClient.getQueryData(queryKeys.me)).toBeUndefined()
  })

  it('a failed sign-in leaves no session behind', async () => {
    capture('post', '/api/user/signin', { error: 'Invalid email or password' }, 401)
    const { result } = render(() => useSignIn())

    await act(async () => {
      await expect(result.current.mutateAsync({ email: 'd@x.io', password: 'wrong-pass' })).rejects.toBeTruthy()
    })

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('useSignOut forgets the token and every cached query', () => {
    useAuthStore.getState().setAuth(authUser())
    queryClient.setQueryData(queryKeys.saved.counts, { total: 2 })
    const { result } = render(() => useSignOut())

    act(() => result.current())

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(queryClient.getQueryData(queryKeys.saved.counts)).toBeUndefined()
  })
})
