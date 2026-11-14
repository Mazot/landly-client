import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { authUser, organisation, userProfile } from '@/test/factories'
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
    expect(screen.getByRole('complementary', { name: 'Places on the map' })).toBeInTheDocument()
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

  it('/add, /add/sent/{id}, /account and /account/edit need an account: a guest is sent to sign in', async () => {
    capture('get', '/api/common/countries', [])
    for (const route of ['/add', '/add/sent/some-id', '/account', '/account/edit']) {
      const { unmount } = renderApp(<App />, { route })
      expect(await screen.findByText('Welcome back')).toBeInTheDocument()
      unmount()
    }
  })

  it('/add is the add-a-place screen for a signed-in user', async () => {
    useAuthStore.getState().setAuth(authUser())
    capture('get', '/api/common/countries', [])
    capture('get', '/api/common/org_types', [])
    capture('get', '/api/corridor/list', { items: [], total: 0 })
    renderApp(<App />, { route: '/add' })
    expect(await screen.findByRole('heading', { name: 'Add a place' })).toBeInTheDocument()
  })

  it('/account and /account/edit are the account screens for a signed-in user', async () => {
    const me = authUser()
    useAuthStore.getState().setAuth(me)
    capture('get', '/api/user/me', userProfile({ id: me.id, name: 'Daria K.' }))
    capture('get', `/api/user/${me.id}/languages`, { userId: me.id, languageIds: [] })
    capture('get', '/api/common/countries', [])
    capture('get', '/api/common/org_types', [])
    capture('get', '/api/common/languages', [])
    capture('get', '/api/organisation/mine', { items: [], total: 0 })
    capture('get', '/api/person/mine', { items: [], total: 0 })
    capture('get', '/api/corridor/list', { items: [], total: 0 })
    const account = renderApp(<App />, { route: '/account' })
    expect(await screen.findByRole('heading', { name: 'Daria K.' })).toBeInTheDocument()
    account.unmount()
    renderApp(<App />, { route: '/account/edit' })
    expect(await screen.findByRole('heading', { name: 'Edit profile' })).toBeInTheDocument()
  })

  it('/place/{id} is public: a guest opens a place\'s full page', async () => {
    capture('get', '/api/organisation/fetch/p1', { ...organisation({ id: 'p1', name: 'Public place', latitude: null, longitude: null }) })
    capture('get', '/api/common/countries', [])
    capture('get', '/api/common/org_types', [])
    capture('get', '/api/images/list/p1', { items: [], total: 0 })
    capture('get', '/api/country-connection/list', { items: [], total: 0 })
    capture('get', '/api/review/summary', { count: 0, ratingAvg: null, byRating: [] })
    capture('get', '/api/review/list', { items: [], total: 0 })
    capture('post', '/api/organisation/visit/p1', { visitsCount: 1 })
    renderApp(<App />, { route: '/place/p1' })
    expect(await screen.findByRole('heading', { level: 1, name: 'Public place' })).toBeInTheDocument()
  })

  it('renders nothing for routes that are not built yet (claim links, unknown paths)', () => {
    for (const route of ['/claim/token', '/nope']) {
      const { container, unmount } = renderApp(<App />, { route })
      expect(container.innerHTML).toBe('')
      unmount()
    }
  })
})
