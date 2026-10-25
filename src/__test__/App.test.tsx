import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { authUser } from '@/test/factories'
import { renderApp } from '@/test/render'
import { capture } from '@/test/server'
import App from '../App'

describe('App routes', () => {
  it.each([
    ['/signin', 'Welcome back'],
    ['/signup', 'Create your account'],
    ['/auth/google/callback', "Google sign-in didn't work"],
  ])('%s renders its screen', async (route, heading) => {
    capture('get', '/api/common/countries', [])
    renderApp(<App />, { route })
    expect(await screen.findByText(heading)).toBeInTheDocument()
  })

  it('/ is the public landing for guests', async () => {
    capture('get', '/api/common/countries', [])
    capture('get', '/api/common/org_types', [])
    renderApp(<App />, { route: '/' })
    expect(await screen.findByText('Landly · for people abroad')).toBeInTheDocument()
  })

  it('sends a signed-in user from the landing, sign-in and sign-up on to /map (not built yet: empty)', () => {
    useAuthStore.getState().setAuth(authUser())
    for (const route of ['/', '/signin', '/signup']) {
      const { container, unmount } = renderApp(<App />, { route })
      expect(container.innerHTML).toBe('')
      unmount()
    }
  })

  it('renders nothing for routes that are not built yet (claim links, unknown paths)', () => {
    for (const route of ['/claim/token', '/nope']) {
      const { container, unmount } = renderApp(<App />, { route })
      expect(container.innerHTML).toBe('')
      unmount()
    }
  })
})
