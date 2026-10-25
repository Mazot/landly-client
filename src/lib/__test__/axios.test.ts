import { describe, expect, it, vi } from 'vitest'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/stores/authStore'
import { authUser } from '@/test/factories'
import { capture } from '@/test/server'
import apiClient, { API_URL } from '../axios'

describe('apiClient', () => {
  it('targets VITE_API_URL', () => {
    expect(API_URL).toBe('http://api.test')
    expect(apiClient.defaults.baseURL).toBe('http://api.test')
  })

  it('strips trailing slashes from VITE_API_URL', async () => {
    vi.stubEnv('VITE_API_URL', 'http://api.test///')
    vi.resetModules()
    const fresh = await import('../axios')
    expect(fresh.API_URL).toBe('http://api.test')
  })

  it('uses the same origin when VITE_API_URL is unset (Vite dev proxy)', async () => {
    vi.stubEnv('VITE_API_URL', undefined)
    vi.resetModules()
    const fresh = await import('../axios')
    expect(fresh.API_URL).toBe('')
  })

  it('sends the Bearer token of the session', async () => {
    useAuthStore.getState().setAuth(authUser({ token: 'abc' }))
    const requests = capture('get', '/api/user/me', {})
    await apiClient.get('/api/user/me')
    expect(requests[0].headers.get('authorization')).toBe('Bearer abc')
  })

  it('sends no Authorization header without a session', async () => {
    const requests = capture('get', '/api/healthcheck', 'Healthcheck')
    await apiClient.get('/api/healthcheck')
    expect(requests[0].headers.has('authorization')).toBe(false)
  })

  it('serializes array params comma-separated', async () => {
    const requests = capture('get', '/api/organisation/search', { items: [], total: 0 })
    await apiClient.get('/api/organisation/search', { params: { types: ['embassy', 'helper'], lat: 1, lng: 2 } })
    expect(requests[0].query.get('types')).toBe('embassy,helper')
    expect(requests[0].query.get('lat')).toBe('1')
  })

  it('ends the session on a 401 to a request that carried the token', async () => {
    useAuthStore.getState().setAuth(authUser())
    queryClient.setQueryData(['me'], { role: 'admin' })
    capture('get', '/api/user/me', { error: 'Invalid Token' }, 401)

    await expect(apiClient.get('/api/user/me')).rejects.toMatchObject({ response: { status: 401 } })

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(queryClient.getQueryData(['me'])).toBeUndefined()
  })

  it('leaves the session alone on a 401 without a token (wrong password)', async () => {
    queryClient.setQueryData(['countries'], [])
    capture('post', '/api/user/signin', { error: 'Invalid email or password' }, 401)

    await expect(apiClient.post('/api/user/signin', {})).rejects.toMatchObject({ response: { status: 401 } })

    expect(queryClient.getQueryData(['countries'])).toEqual([])
  })

  it('does not end the session on other errors', async () => {
    useAuthStore.getState().setAuth(authUser())
    capture('get', '/api/moderation/queue', { error: 'forbidden' }, 403)

    await expect(apiClient.get('/api/moderation/queue')).rejects.toMatchObject({ response: { status: 403 } })

    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })
})
