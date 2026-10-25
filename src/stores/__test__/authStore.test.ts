import { describe, expect, it, vi } from 'vitest'
import { authUser } from '@/test/factories'
import { useAuthStore } from '../authStore'

describe('authStore', () => {
  it('setAuth keeps the token apart from the user and persists both', () => {
    const user = authUser({ id: 'u1', username: 'daria', email: 'd@x.io', token: 'jwt' })

    useAuthStore.getState().setAuth(user)

    expect(useAuthStore.getState()).toMatchObject({
      token: 'jwt',
      isAuthenticated: true,
      user: { id: 'u1', username: 'daria', email: 'd@x.io' },
    })
    expect(useAuthStore.getState().user).not.toHaveProperty('token')
    expect(localStorage.getItem('auth_token')).toBe('jwt')
    expect(JSON.parse(localStorage.getItem('auth_user')!)).toEqual({ id: 'u1', username: 'daria', email: 'd@x.io' })
  })

  it('clearAuth forgets the session everywhere', () => {
    useAuthStore.getState().setAuth(authUser())

    useAuthStore.getState().clearAuth()

    expect(useAuthStore.getState()).toMatchObject({ user: null, token: null, isAuthenticated: false })
    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(localStorage.getItem('auth_user')).toBeNull()
  })

  it('restores the session from localStorage on load', async () => {
    localStorage.setItem('auth_token', 'stored')
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', username: 'daria', email: 'd@x.io' }))
    vi.resetModules()

    const { useAuthStore: fresh } = await import('../authStore')

    expect(fresh.getState()).toMatchObject({ token: 'stored', isAuthenticated: true, user: { id: 'u1' } })
  })

  it('ignores a corrupted stored user', async () => {
    localStorage.setItem('auth_user', '{not json')
    vi.resetModules()

    const { useAuthStore: fresh } = await import('../authStore')

    expect(fresh.getState()).toMatchObject({ user: null, token: null, isAuthenticated: false })
  })
})
