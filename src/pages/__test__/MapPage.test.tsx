import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useMap } from '@vis.gl/react-google-maps'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authUser, country, list, organisation } from '@/test/factories'
import { renderApp } from '@/test/render'
import { API, capture, server } from '@/test/server'
import { useAuthStore } from '@/stores/authStore'
import type { CountryDetail } from '@/types/api'
import MapPage from '../MapPage'

/**
 * Stand-in for the Google map: it only reports its start viewport, lets a test
 * make it "go idle" over a given area and renders its markers as buttons.
 */
interface FakeMapProps {
  children: ReactNode
  onIdle: (event: { map: { getBounds: () => { toJSON: () => object } | undefined } }) => void
  onClick: () => void
  defaultBounds?: object
  defaultCenter?: object
  defaultZoom?: number
}
interface FakeMarkerProps {
  children: ReactNode
  onClick: () => void
  title: string
  zIndex: number
}

vi.mock('@vis.gl/react-google-maps', async () => {
  const { createElement } = await import('react')
  return {
    useMap: vi.fn(),
    Map: ({ children, onIdle, onClick, defaultBounds, defaultCenter, defaultZoom }: FakeMapProps) =>
      createElement(
        'div',
        { 'data-testid': 'map', 'data-start': JSON.stringify(defaultBounds ?? { defaultCenter, defaultZoom }) },
        createElement('button', { onClick: () => onIdle({ map: { getBounds: () => ({ toJSON: () => ({ south: 52, west: 13, north: 53, east: 14 }) }) } }) }, 'go idle'),
        createElement('button', { onClick: () => onIdle({ map: { getBounds: () => undefined } }) }, 'go idle without bounds'),
        createElement('button', { onClick: onClick }, 'click the map'),
        children,
      ),
    AdvancedMarker: ({ children, onClick, title, zIndex }: FakeMarkerProps) => createElement('button', { title, 'data-z': zIndex, onClick }, children),
  }
})

const russia = country({ name: 'Russia' })
const germany = country({ name: 'Germany' })
const ring: [number, number][] = [[6, 47], [15, 47], [15, 55], [6, 55], [6, 47]]
const germanyDetail: CountryDetail = { ...germany, geoJson: { type: 'Polygon', coordinates: [ring] }, totalPlaces: 2, placesByType: [] }
const embassyType = { id: 'type-1', type: 'embassy', slug: 'embassy', title: 'Embassy', color: null }

const embassy = organisation({ name: 'Russian Embassy', organisationTypeId: 'type-1', latitude: 52.5, longitude: 13.4 })
const noPoint = organisation({ name: 'Online only', latitude: null, longitude: null })
const untyped = organisation({ name: 'Pop-up fair', organisationTypeId: null, latitude: 52.6, longitude: 13.5 })

function arrange({ places = [embassy, noPoint, untyped], detail = germanyDetail }: { places?: ReturnType<typeof organisation>[]; detail?: CountryDetail } = {}) {
  capture('get', '/api/common/countries', [russia, germany])
  capture('get', '/api/common/org_types', [embassyType])
  server.use(http.get(`${API}/api/common/countries/:id`, () => HttpResponse.json(detail)))
  return capture('get', '/api/organisation/search', list(places))
}

const open = () =>
  renderApp(
    <Routes>
      <Route path="/map" element={<MapPage />} />
      <Route path="/signin" element={<p>sign-in page</p>} />
      <Route path="/signup" element={<p>sign-up page</p>} />
    </Routes>,
    { route: '/map' },
  )

const goIdle = () => userEvent.click(screen.getByRole('button', { name: 'go idle' }))
const sidePanel = () => screen.getByRole('complementary', { name: 'Places on the map' })

describe('MapPage', () => {
  const panTo = vi.fn()
  beforeEach(() => {
    panTo.mockClear()
    vi.mocked(useMap).mockReturnValue({ panTo } as unknown as google.maps.Map)
  })

  it('waits for the destination country, then starts the map on its border', async () => {
    arrange()
    open()
    expect(screen.getByText('Loading the map…')).toBeInTheDocument()
    expect(screen.queryByTestId('map')).not.toBeInTheDocument()

    const map = await screen.findByTestId('map')
    expect(JSON.parse(map.dataset.start!)).toEqual({ west: 6, east: 15, south: 47, north: 55 })
  })

  it('starts on the whole world when the destination has no border', async () => {
    arrange({ detail: { ...germanyDetail, geoJson: null } })
    open()
    const map = await screen.findByTestId('map')
    expect(JSON.parse(map.dataset.start!)).toEqual({ defaultCenter: { lat: 20, lng: 0 }, defaultZoom: 2 })
  })

  it('searches nothing until the map has a viewport, then asks for that viewport', async () => {
    const searches = arrange()
    open()
    await screen.findByTestId('map')
    expect(searches).toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Loading organizations…' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'go idle without bounds' }))
    expect(searches).toHaveLength(0)

    await goIdle()
    await waitFor(() => expect(searches).toHaveLength(1))
    expect(Object.fromEntries(searches[0].query)).toEqual({ min_lat: '52', max_lat: '53', min_lng: '13', max_lng: '14', limit: '100' })
  })

  it('lists the places found and pins those that have a point', async () => {
    arrange()
    open()
    await screen.findByTestId('map')
    await goIdle()

    expect(await within(sidePanel()).findByText('Russian Embassy')).toBeInTheDocument()
    expect(within(sidePanel()).getByText('Online only')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3 places in this area' })).toBeInTheDocument()
    // Only places with coordinates are markers; a place without a type gets the neutral pin.
    expect(screen.getByTitle('Russian Embassy')).toBeInTheDocument()
    expect(screen.queryByTitle('Online only')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Russian Embassy' })).toHaveClass('bg-type-embassy')
    expect(screen.getByRole('img', { name: 'Pop-up fair' })).toHaveClass('bg-ink-3')
  })

  it('selects a place from its marker, pans to it, and clears the selection on a map click', async () => {
    arrange()
    open()
    await screen.findByTestId('map')
    await goIdle()
    await within(sidePanel()).findByText('Russian Embassy')

    await userEvent.click(screen.getByTitle('Russian Embassy'))
    expect(screen.getByTitle('Russian Embassy')).toHaveAttribute('data-z', '1')
    expect(screen.getByRole('img', { name: 'Russian Embassy' })).toHaveClass('scale-150')
    expect(within(sidePanel()).getByRole('button', { name: /Russian Embassy/ })).toHaveAttribute('aria-pressed', 'true')
    expect(panTo).toHaveBeenCalledWith({ lat: 52.5, lng: 13.4 })

    await userEvent.click(screen.getByRole('button', { name: 'click the map' }))
    expect(screen.getByRole('img', { name: 'Russian Embassy' })).not.toHaveClass('scale-150')
  })

  it('does not pan to a selected place without a point, or before the map exists', async () => {
    arrange()
    open()
    await screen.findByTestId('map')
    await goIdle()
    await userEvent.click(await within(sidePanel()).findByRole('button', { name: /Online only/ }))
    expect(panTo).not.toHaveBeenCalled()

    vi.mocked(useMap).mockReturnValue(null)
    await userEvent.click(within(sidePanel()).getByRole('button', { name: /Russian Embassy/ }))
    expect(panTo).not.toHaveBeenCalled()
  })

  it('lets a phone user pick a place from the results sheet', async () => {
    arrange()
    open()
    await screen.findByTestId('map')
    await goIdle()
    await within(sidePanel()).findByText('Russian Embassy')

    await userEvent.click(screen.getByRole('button', { name: '3 places in this area' }))
    const sheet = screen.getByRole('dialog', { name: 'Places on the map' })
    await userEvent.click(within(sheet).getByRole('button', { name: /Russian Embassy/ }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(panTo).toHaveBeenCalledWith({ lat: 52.5, lng: 13.4 })
  })

  it('says so when the search fails', async () => {
    arrange()
    capture('get', '/api/organisation/search', { error: 'boom' }, 500)
    open()
    await screen.findByTestId('map')
    await goIdle()
    expect(await within(sidePanel()).findByText("Couldn't load places")).toBeInTheDocument()
  })

  it('offers sign-in and sign-up to a guest, and only the language to a signed-in user', async () => {
    arrange()
    const { unmount } = open()
    await screen.findByTestId('map')
    expect(screen.getAllByRole('link', { name: 'Sign in' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/signup')
    unmount()

    useAuthStore.getState().setAuth(authUser())
    open()
    await screen.findByTestId('map')
    expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Sign up' })).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Language' })).toBeInTheDocument()
  })
})
