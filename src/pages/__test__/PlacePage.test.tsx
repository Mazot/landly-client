import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode, type ReactNode } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import { authUser, country, image, list, organisation, review, savedItem } from '@/test/factories'
import { renderApp } from '@/test/render'
import { capture } from '@/test/server'
import { setViewportWidth } from '@/test/viewport'
import PlacePage from '../PlacePage'

vi.mock('@vis.gl/react-google-maps', async () => {
  const { createElement } = await import('react')
  return {
    Map: ({ children, defaultCenter }: { children: ReactNode; defaultCenter: object }) => createElement('div', { 'data-testid': 'mini-map', 'data-center': JSON.stringify(defaultCenter) }, children),
    AdvancedMarker: ({ children }: { children: ReactNode }) => createElement('div', null, children),
  }
})

const serbia = country({ name: 'Serbia', flag: '🇷🇸' })
const embassyType = { id: 'type-embassy', type: 'embassy', slug: 'embassy', title: 'Embassy', color: null }
const full = organisation({
  id: 'o1',
  name: 'Embassy of Russia',
  organisationTypeId: embassyType.id,
  locationCountryId: serbia.id,
  verified: true,
  address: 'Deligradska 32',
  description: 'Consular section.',
  services: ['Passports', 'Visas'],
  languages: ['Russian', 'Serbian'],
  tel: '+381 11 1',
  openingHours: { mon: [['09:00', '13:00']] },
  timezone: 'Europe/Belgrade',
  locationSource: 'google',
  creator: { username: 'maria', name: 'Maria A.', avatarColor: null },
  community: { peopleCame: 2, stillActivePct: 100, lastCheckinAt: null, tips: [] },
})

function Probe() {
  const location = useLocation()
  return <output data-testid="path">{location.pathname}</output>
}

const open = (id = 'o1') =>
  renderApp(
    <>
      <Routes>
        <Route path="/place/:id" element={<PlacePage />} />
        <Route path="*" element={null} />
      </Routes>
      <Probe />
    </>,
    { route: `/place/${id}` },
  )

beforeEach(async () => {
  await i18n.changeLanguage('en')
  capture('get', '/api/organisation/fetch/o1', full)
  capture('get', '/api/common/org_types', [embassyType])
  capture('get', '/api/common/countries', [serbia])
  capture('get', '/api/images/list/:id', list([image({ url: 'https://img/2' }), image({ url: 'https://img/1', isPrimary: true })]))
  capture('get', '/api/country-connection/list', list([]))
  capture('get', '/api/review/summary', { count: 1, ratingAvg: 5, byRating: [5, 4, 3, 2, 1].map((rating) => ({ rating, count: rating === 5 ? 1 : 0 })) })
  capture('get', '/api/review/list', list([review({ text: 'Great' })]))
  capture('post', '/api/organisation/visit/:id', { visitsCount: 7 })
})

describe('PlacePage', () => {
  it('desktop: breadcrumbs, the primary photo, every section and the side card; the visit is counted once', async () => {
    const visits = capture('post', '/api/organisation/visit/o1', { visitsCount: 7 })
    open()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { level: 1, name: 'Embassy of Russia' })).toBeInTheDocument()
    const crumbs = within(screen.getByRole('navigation', { name: 'Breadcrumbs' }))
    expect(crumbs.getByRole('link', { name: 'Map' })).toHaveAttribute('href', '/map')
    expect(await crumbs.findByText('Serbia')).toBeInTheDocument()
    expect(crumbs.getByText('Embassy of Russia')).toHaveAttribute('aria-current', 'page')
    expect(await screen.findByRole('img', { name: 'Photo of Embassy of Russia' })).toHaveAttribute('src', 'https://img/1')
    for (const heading of ['About', 'Services', 'Photos · 2', 'Opening hours', 'Community check-ins', 'Reviews', 'Added by', 'Languages']) {
      expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()
    }
    expect(screen.queryByRole('heading', { name: 'Consular network' })).not.toBeInTheDocument()
    expect(within(screen.getByRole('complementary')).getByRole('link', { name: 'Directions' })).toBeInTheDocument()
    expect(screen.getByTestId('mini-map')).toBeInTheDocument()
    expect(await screen.findByText('7 visits')).toBeInTheDocument()
    expect(visits).toHaveLength(1)
  })

  it('counts one visit even when StrictMode runs the effect twice', async () => {
    const visits = capture('post', '/api/organisation/visit/o1', { visitsCount: 1 })
    renderApp(
      <StrictMode>
        <Routes>
          <Route path="/place/:id" element={<PlacePage />} />
        </Routes>
      </StrictMode>,
      { route: '/place/o1' },
    )
    expect(await screen.findByRole('heading', { level: 1, name: 'Embassy of Russia' })).toBeInTheDocument()
    await new Promise((resolve) => setTimeout(resolve, 200))
    expect(visits).toHaveLength(1)
  })

  it('tablet: the side card sits under the head, not beside the page', async () => {
    setViewportWidth(834)
    open()
    expect(await screen.findByRole('heading', { level: 1, name: 'Embassy of Russia' })).toBeInTheDocument()
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Directions' })).toBeInTheDocument()
  })

  it('phone: its own header goes back to the map; its bookmark sends a guest to sign in', async () => {
    setViewportWidth(375)
    open()
    expect(await screen.findByRole('heading', { level: 1, name: 'Embassy of Russia' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Breadcrumbs' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Save Embassy of Russia' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/signin')
  })

  it('phone: the header bookmark saves for a signed-in user, and the arrow goes back to the map', async () => {
    setViewportWidth(375)
    useAuthStore.getState().setAuth(authUser())
    capture('get', '/api/saved/list', list([]))
    const saved = capture('post', '/api/saved/create', { id: 's1' })
    open()
    await userEvent.click(await screen.findByRole('button', { name: 'Save Embassy of Russia' }))
    await waitFor(() => expect(saved[0]?.body).toEqual({ kind: 'org', target_id: 'o1' }))
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/map')
  })

  it('links the consular network of an embassy', async () => {
    capture('get', '/api/country-connection/list', list([{ id: 'c1', commonInfo: null, embassyOrgId: 'o1', consulateOrgId: 'k1', locationCountryId: null, embassy: null, consulate: { id: 'k1', name: 'Consulate', city: 'Niš' } }]))
    open()
    expect(await screen.findByRole('heading', { name: 'Consular network' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Consulate · Niš' })[0]).toHaveAttribute('href', '/place/k1')
  })

  it('phone: the header bookmark shows a saved place as saved', async () => {
    setViewportWidth(375)
    useAuthStore.getState().setAuth(authUser())
    capture('get', '/api/saved/list', list([savedItem({ kind: 'org', targetId: 'o1' })]))
    open()
    expect(await screen.findByRole('button', { name: 'Remove Embassy of Russia from saved' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('opens another place from the consular network fresh: its own head and mini map', async () => {
    capture('get', '/api/country-connection/list', list([{ id: 'c1', commonInfo: null, embassyOrgId: 'o1', consulateOrgId: 'k1', locationCountryId: null, embassy: null, consulate: { id: 'k1', name: 'Consulate', city: 'Niš' } }]))
    capture('get', '/api/organisation/fetch/k1', organisation({ id: 'k1', name: 'Consulate in Niš', latitude: 43.32, longitude: 21.9 }))
    const visits = capture('post', '/api/organisation/visit/:id', { visitsCount: 1 })
    open()
    expect(JSON.parse((await screen.findByTestId('mini-map')).dataset.center!)).toEqual({ lat: full.latitude, lng: full.longitude })
    await userEvent.click((await screen.findAllByRole('link', { name: 'Consulate · Niš' }))[0])
    expect(await screen.findByRole('heading', { level: 1, name: 'Consulate in Niš' })).toBeInTheDocument()
    expect(JSON.parse(screen.getByTestId('mini-map').dataset.center!)).toEqual({ lat: 43.32, lng: 21.9 })
    // Each place opened counts its own visit.
    await waitFor(() => expect(visits).toHaveLength(2))
  })

  it('leaves out what a place does not have', async () => {
    capture('get', '/api/organisation/fetch/o2', organisation({ id: 'o2', name: 'Bare place', latitude: null, longitude: null }))
    capture('get', '/api/images/list/:id', list([]))
    // Without the country list the breadcrumbs skip the country.
    capture('get', '/api/common/countries', { error: 'boom' }, 500)
    open('o2')
    expect(await screen.findByRole('heading', { level: 1, name: 'Bare place' })).toBeInTheDocument()
    for (const heading of ['About', 'Services', 'Opening hours', 'Community check-ins', 'Added by', 'Languages']) {
      expect(screen.queryByRole('heading', { name: heading })).not.toBeInTheDocument()
    }
    expect(screen.queryByRole('heading', { name: /Photos/ })).not.toBeInTheDocument()
    expect(screen.queryByTestId('mini-map')).not.toBeInTheDocument()
    expect(within(screen.getByRole('navigation', { name: 'Breadcrumbs' })).queryByText('Serbia')).not.toBeInTheDocument()
  })

  it('says a place does not exist, with the way back to the map', async () => {
    capture('get', '/api/organisation/fetch/gone', { error: 'Not found' }, 404)
    open('gone')
    expect(await screen.findByText("This place doesn't exist or was removed")).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to the map' })).toHaveAttribute('href', '/map')
  })

  it('offers to retry when the place could not be loaded', async () => {
    capture('get', '/api/organisation/fetch/o3', { error: 'boom' }, 500)
    open('o3')
    expect(await screen.findByText("Couldn't load this place")).toBeInTheDocument()
    capture('get', '/api/organisation/fetch/o3', organisation({ id: 'o3', name: 'Back again' }))
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Back again' })).toBeInTheDocument()
  })
})
