import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { authUser } from '@/test/factories'
import { renderApp } from '@/test/render'
import { capture } from '@/test/server'
import App from '../App'

// The real map needs Google's script; routing is all these tests are about.
vi.mock('@vis.gl/react-google-maps', async () => {
  const { createElement } = await import('react')
  return { useMap: () => null, Map: () => createElement('div', { 'data-testid': 'map' }), AdvancedMarker: () => null }
})

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

  it('/map is public: a guest browses the map without an account', async () => {
    capture('get', '/api/common/countries', [])
    capture('get', '/api/common/org_types', [])
    renderApp(<App />, { route: '/map' })
    expect(await screen.findByTestId('map')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Places on the map' })).toBeInTheDocument()
  })

  it('sends a signed-in user from the landing, sign-in and sign-up on to the map', async () => {
    useAuthStore.getState().setAuth(authUser())
    capture('get', '/api/common/countries', [])
    capture('get', '/api/common/org_types', [])
    for (const route of ['/', '/signin', '/signup']) {
      const { unmount } = renderApp(<App />, { route })
      expect(await screen.findByTestId('map')).toBeInTheDocument()
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
