import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useMap } from '@vis.gl/react-google-maps'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { useCorridorStore } from '@/stores/corridorStore'
import { authUser, corridor, country, list, organisation, savedItem, userProfile } from '@/test/factories'
import { renderApp } from '@/test/render'
import { API, capture, server } from '@/test/server'
import { setViewportWidth } from '@/test/viewport'
import type { CountryDetail } from '@/types/api'
import MapPage from '../MapPage'

interface Box {
  south: number
  west: number
  north: number
  east: number
}

interface FakeMapProps {
  children: ReactNode
  onIdle: (event: { map: unknown }) => void
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

/** The map event Google sends when the map comes to rest over `box` (or reports no bounds). */
const resting = (box: Box | null) => ({
  map: {
    getBounds: () => (box ? { toJSON: () => box } : undefined),
    getCenter: () => (box ? { toJSON: () => ({ lat: (box.south + box.north) / 2, lng: (box.west + box.east) / 2 }) } : undefined),
  },
})

/** Stand-in for the Google map: reports its start view, "comes to rest" on demand, renders markers as buttons. */
vi.mock('@vis.gl/react-google-maps', async () => {
  const { createElement } = await import('react')
  return {
    useMap: vi.fn(),
    Map: ({ children, onIdle, onClick, defaultBounds, defaultCenter, defaultZoom }: FakeMapProps) =>
      createElement(
        'div',
        { 'data-testid': 'map', 'data-start': JSON.stringify(defaultBounds ?? { defaultCenter, defaultZoom }) },
        createElement('button', { onClick: () => onIdle(resting({ south: 52, west: 13, north: 53, east: 14 })) }, 'rest over Berlin'),
        createElement('button', { onClick: () => onIdle(resting({ south: 53, west: 9, north: 54, east: 10 })) }, 'rest over Hamburg'),
        createElement('button', { onClick: () => onIdle(resting(null)) }, 'rest without bounds'),
        createElement('button', { onClick: onClick }, 'click the map'),
        children,
      ),
    AdvancedMarker: ({ children, onClick, title, zIndex }: FakeMarkerProps) => createElement('button', { title, 'data-z': zIndex, onClick }, children),
  }
})

const russia = country({ name: 'Russia', flag: '🇷🇺' })
const germany = country({ name: 'Germany', flag: '🇩🇪' })
const serbia = country({ name: 'Serbia', flag: '🇷🇸' })
const ring: [number, number][] = [[6, 47], [15, 47], [15, 55], [6, 55], [6, 47]]
const detail = (c: typeof germany, over: Partial<CountryDetail> = {}): CountryDetail => ({
  ...c,
  geoJson: { type: 'Polygon', coordinates: [ring] },
  totalPlaces: 73,
  placesByType: [{ slug: 'business', count: 30 }, { slug: 'embassy', count: 8 }],
  ...over,
})
const embassyType = { id: 'type-1', type: 'embassy', slug: 'embassy', title: 'Embassy', color: null }
const businessType = { id: 'type-2', type: 'business', slug: 'business', title: 'Business', color: null }

const embassy = organisation({ name: 'Russian Embassy', organisationTypeId: 'type-1', latitude: 52.5, longitude: 13.4, city: 'Berlin' })
const noPoint = organisation({ name: 'Online only', latitude: null, longitude: null })
const untyped = organisation({ name: 'Pop-up fair', organisationTypeId: null, latitude: 52.6, longitude: 13.5, services: ['Visa help'] })

/** The places the search answers with; every request is recorded. */
function arrange({ places = [embassy, noPoint, untyped], details = {} as Record<string, CountryDetail> } = {}) {
  const searches: URLSearchParams[] = []
  const byId = { [germany.id]: detail(germany), [serbia.id]: detail(serbia, { geoJson: null, totalPlaces: 7 }), ...details }
  capture('get', '/api/common/countries', [russia, germany, serbia])
  capture('get', '/api/common/org_types', [embassyType, businessType])
  server.use(
    http.get(`${API}/api/common/countries/:id`, ({ params }) => HttpResponse.json(byId[params.id as string])),
    http.get(`${API}/api/organisation/search`, ({ request }) => {
      searches.push(new URL(request.url).searchParams)
      return HttpResponse.json(list(places))
    }),
  )
  return searches
}

/** Prints the URL's query so a test can see what the filters wrote to it. */
function Probe() {
  return <output data-testid="url">{useLocation().search}</output>
}

const open = (route = '/map') =>
  renderApp(
    <Routes>
      <Route
        path="/map"
        element={
          <>
            <MapPage />
            <Probe />
          </>
        }
      />
    </Routes>,
    { route },
  )

const rest = (where: 'Berlin' | 'Hamburg' = 'Berlin') => userEvent.click(screen.getByRole('button', { name: `rest over ${where}` }))
const panel = () => screen.getByRole('complementary', { name: 'Places on the map' })
const lastSearch = (searches: URLSearchParams[]) => searches[searches.length - 1]
const query = (params: URLSearchParams) => Object.fromEntries(params)

/** Opens the map, waits for it, lets it come to rest over Berlin and waits for the first list. */
async function ready(searches = arrange()) {
  open()
  await screen.findByTestId('map')
  await rest()
  await waitFor(() => expect(searches.length).toBeGreaterThan(0))
  await within(panel()).findByText('Russian Embassy')
  return searches
}

describe('MapPage', () => {
  const map = { panTo: vi.fn(), setZoom: vi.fn(), getZoom: vi.fn(() => 6) }
  beforeEach(() => {
    vi.clearAllMocks()
    map.getZoom.mockReturnValue(6)
    vi.mocked(useMap).mockReturnValue(map as unknown as google.maps.Map)
    useCorridorStore.setState({ fromId: null, toId: null })
  })

  describe('the map', () => {
    it('waits for the destination country, then starts the map on its border', async () => {
      arrange()
      open()
      expect(screen.getByText('Loading the map…')).toBeInTheDocument()
      expect(screen.queryByTestId('map')).not.toBeInTheDocument()
      const start = await screen.findByTestId('map')
      expect(JSON.parse(start.dataset.start!)).toEqual({ west: 6, east: 15, south: 47, north: 55 })
    })

    it('starts on the whole world when the destination has no border', async () => {
      arrange({ details: { [germany.id]: detail(germany, { geoJson: null }) } })
      open()
      const start = await screen.findByTestId('map')
      expect(JSON.parse(start.dataset.start!)).toEqual({ defaultCenter: { lat: 20, lng: 0 }, defaultZoom: 2 })
    })

    it('pins the places that have a point, the selected one on top', async () => {
      await ready()
      expect(screen.getByTitle('Russian Embassy')).toBeInTheDocument()
      expect(screen.getByTitle('Pop-up fair')).toBeInTheDocument()
      expect(screen.queryByTitle('Online only')).not.toBeInTheDocument()
      expect(within(screen.getByTitle('Russian Embassy')).getByRole('img')).toHaveClass('bg-type-embassy')
      expect(within(screen.getByTitle('Pop-up fair')).getByRole('img')).toHaveClass('bg-ink-3')
      expect(within(screen.getByTitle('Russian Embassy')).getByRole('img')).not.toHaveClass('brightness-75')
      await userEvent.click(screen.getByTitle('Russian Embassy'))
      expect(screen.getByTitle('Russian Embassy')).toHaveAttribute('data-z', '1')
      expect(screen.getByTitle('Pop-up fair')).toHaveAttribute('data-z', '0')
    })

    it('pins a place waiting for moderation muted, and marks it in the list', async () => {
      const pending = organisation({ name: 'Neka', status: 'pending', organisationTypeId: 'type-2', latitude: 52.51, longitude: 13.41 })
      await ready(arrange({ places: [embassy, pending] }))
      expect(within(screen.getByTitle('Neka')).getByRole('img', { name: 'Neka · Pending review' })).toHaveClass('bg-type-business', 'brightness-75')
      const row = within(panel()).getByRole('button', { name: /Neka/ })
      expect(row).toHaveTextContent('Pending review')
      expect(within(panel()).getByRole('button', { name: /Russian Embassy/ })).not.toHaveTextContent('Pending review')
    })

    it('zooms with the controls, from the zoom the map has — or the world zoom before it knows', async () => {
      await ready()
      await userEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
      expect(map.setZoom).toHaveBeenLastCalledWith(7)
      await userEvent.click(screen.getByRole('button', { name: 'Zoom out' }))
      expect(map.setZoom).toHaveBeenLastCalledWith(5)
      map.getZoom.mockReturnValue(undefined as never)
      await userEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
      expect(map.setZoom).toHaveBeenLastCalledWith(3)
      await userEvent.click(screen.getByRole('button', { name: 'Zoom out' }))
      expect(map.setZoom).toHaveBeenLastCalledWith(1)
    })

    it('does nothing with the controls when there is no map yet', async () => {
      vi.mocked(useMap).mockReturnValue(null)
      vi.stubGlobal('navigator', { ...navigator, geolocation: { getCurrentPosition: (success: PositionCallback) => success({ coords: { latitude: 1, longitude: 2 } } as GeolocationPosition) } })
      await ready()
      await userEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
      await userEvent.click(screen.getByRole('button', { name: 'Zoom out' }))
      await userEvent.click(screen.getByRole('button', { name: 'Show my location' }))
      expect(map.setZoom).not.toHaveBeenCalled()
      expect(map.panTo).not.toHaveBeenCalled()
      vi.unstubAllGlobals()
    })

    it('moves to the user on "my location", when the browser can tell', async () => {
      const getCurrentPosition = vi.fn((success: PositionCallback) => success({ coords: { latitude: 52.5, longitude: 13.4 } } as GeolocationPosition))
      vi.stubGlobal('navigator', { ...navigator, geolocation: { getCurrentPosition } })
      await ready()
      await userEvent.click(screen.getByRole('button', { name: 'Show my location' }))
      expect(map.panTo).toHaveBeenCalledWith({ lat: 52.5, lng: 13.4 })
      expect(map.setZoom).toHaveBeenCalledWith(13)
      vi.unstubAllGlobals()
    })

    it('takes "my location" away when the browser refuses it', async () => {
      const getCurrentPosition = vi.fn((_success: PositionCallback, failure: PositionErrorCallback) => failure({ code: 1 } as GeolocationPositionError))
      vi.stubGlobal('navigator', { ...navigator, geolocation: { getCurrentPosition } })
      await ready()
      await userEvent.click(screen.getByRole('button', { name: 'Show my location' }))
      await waitFor(() => expect(screen.queryByRole('button', { name: 'Show my location' })).not.toBeInTheDocument())
      vi.unstubAllGlobals()
    })

    it('has no "my location" button without geolocation', async () => {
      await ready()
      expect(screen.queryByRole('button', { name: 'Show my location' })).not.toBeInTheDocument()
    })
  })

  describe('search', () => {
    it('searches nothing until the map has come to rest, then asks for that area with its centre as the origin', async () => {
      const searches = arrange()
      open()
      await screen.findByTestId('map')
      expect(searches).toHaveLength(0)
      expect(within(panel()).getByText('Loading organizations…', { selector: 'h1' })).toBeInTheDocument()
      await rest()
      await within(panel()).findByText('Russian Embassy')
      expect(query(searches[0])).toEqual({ min_lat: '52', max_lat: '53', min_lng: '13', max_lng: '14', lat: '52.5', lng: '13.5', sort: 'nearest', location_country_id: germany.id, founder_country_id: russia.id, limit: '100' })
      expect(within(panel()).getByRole('heading', { level: 1, name: '3 organizations' })).toBeInTheDocument()
    })

    it('ignores a rest without bounds', async () => {
      const searches = arrange()
      open()
      await screen.findByTestId('map')
      await userEvent.click(screen.getByRole('button', { name: 'rest without bounds' }))
      expect(searches).toHaveLength(0)
    })

    it('offers "Search this area" after the map moved, and searches the new area when asked', async () => {
      const searches = await ready()
      expect(screen.queryByRole('button', { name: 'Search this area' })).not.toBeInTheDocument()
      await rest('Berlin')
      expect(screen.queryByRole('button', { name: 'Search this area' })).not.toBeInTheDocument()

      await rest('Hamburg')
      expect(searches).toHaveLength(1)
      await userEvent.click(screen.getByRole('button', { name: 'Search this area' }))
      await waitFor(() => expect(searches).toHaveLength(2))
      expect(lastSearch(searches).get('min_lat')).toBe('53')
      expect(screen.queryByRole('button', { name: 'Search this area' })).not.toBeInTheDocument()
    })

    it('on a phone the list follows the map on its own', async () => {
      setViewportWidth(375)
      const searches = arrange()
      open()
      await screen.findByTestId('map')
      await rest('Berlin')
      await waitFor(() => expect(searches).toHaveLength(1))
      await rest('Hamburg')
      await waitFor(() => expect(searches).toHaveLength(2))
      expect(lastSearch(searches).get('min_lat')).toBe('53')
      expect(screen.queryByRole('button', { name: 'Search this area' })).not.toBeInTheDocument()
    })

    it('starts a fresh search, without a button, when the corridor destination changes', async () => {
      const searches = await ready()
      act(() => useCorridorStore.getState().setCorridor(russia.id, serbia.id))
      await screen.findByTestId('map')
      await screen.findByRole('button', { name: /7 places/ })
      await rest('Hamburg')
      await waitFor(() => expect(searches).toHaveLength(2))
      expect(lastSearch(searches).get('min_lat')).toBe('53')
    })

    it('does not show the places of the old filters while the new ones load, but keeps them while panning', async () => {
      const searches = await ready()
      let release = () => {}
      server.use(
        http.get(`${API}/api/organisation/search`, async ({ request }) => {
          searches.push(new URL(request.url).searchParams)
          await new Promise<void>((resolve) => (release = resolve))
          return HttpResponse.json(list([untyped]))
        }),
      )
      await userEvent.click(screen.getByRole('button', { name: 'Open now' }))
      expect(await within(panel()).findByRole('status')).toHaveTextContent('Loading')
      expect(within(panel()).queryByText('Russian Embassy')).not.toBeInTheDocument()
      release()
      await within(panel()).findByText('Pop-up fair')
    })

    it('says the search failed', async () => {
      arrange()
      server.use(http.get(`${API}/api/organisation/search`, () => HttpResponse.json({ error: 'boom' }, { status: 500 })))
      open()
      await screen.findByTestId('map')
      await rest()
      expect(await within(panel()).findByText("Couldn't load places")).toBeInTheDocument()
    })

    it('says when the search stopped at the page size', async () => {
      const many = Array.from({ length: 100 }, (_, i) => organisation({ name: `Place ${i}`, latitude: 52.5, longitude: 13.4 }))
      arrange({ places: many })
      open()
      await screen.findByTestId('map')
      await rest()
      expect(await within(panel()).findByText('Place 0')).toBeInTheDocument()
      expect(within(panel()).getByRole('heading', { level: 1, name: '100+ organizations' })).toBeInTheDocument()
      expect(within(panel()).getByText('Showing the first 100 — zoom in to narrow the search')).toBeInTheDocument()
      // A name search narrows what is shown, so the page size no longer says anything.
      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'place 1' } })
      expect(within(panel()).queryByText(/Showing the first/)).not.toBeInTheDocument()
    })
  })

  describe('name search', () => {
    it('narrows the list and the pins by name, city, address or service — without a new request', async () => {
      const searches = await ready()
      const search = screen.getByRole('searchbox', { name: 'Search places' })
      fireEvent.change(search, { target: { value: '  embassy ' } })
      expect(within(panel()).getByRole('heading', { level: 1, name: '1 organization' })).toBeInTheDocument()
      expect(screen.queryByTitle('Pop-up fair')).not.toBeInTheDocument()
      fireEvent.change(search, { target: { value: 'visa' } })
      expect(within(panel()).getByText('Pop-up fair')).toBeInTheDocument()
      expect(screen.queryByTitle('Russian Embassy')).not.toBeInTheDocument()
      fireEvent.change(search, { target: { value: 'berlin' } })
      expect(within(panel()).getByText('Russian Embassy')).toBeInTheDocument()
      expect(searches).toHaveLength(1)
    })

    it('says nothing matches, and resets the search with the filters', async () => {
      await ready()
      const search = screen.getByRole('searchbox', { name: 'Search places' })
      fireEvent.change(search, { target: { value: 'zzz' } })
      expect(within(panel()).getByText('Nothing matches these filters')).toBeInTheDocument()
      await userEvent.click(within(panel()).getByRole('button', { name: 'Reset filters' }))
      expect(search).toHaveValue('')
      expect(within(panel()).getByText('Russian Embassy')).toBeInTheDocument()
    })
  })

  describe('filters', () => {
    it('writes the quick filters to the URL and to the search request', async () => {
      const searches = await ready()
      await userEvent.click(screen.getByRole('button', { name: 'Open now' }))
      await waitFor(() => expect(lastSearch(searches).get('open_now')).toBe('true'))
      expect(screen.getByTestId('url')).toHaveTextContent('?open=1')
      await userEvent.click(screen.getByRole('button', { name: 'Verified' }))
      await waitFor(() => expect(lastSearch(searches).get('verified')).toBe('true'))
      expect(screen.getByRole('button', { name: 'More filters · 2' })).toBeInTheDocument()
      // The sort order stays the default and is not part of the URL.
      expect(screen.getByTestId('url')).toHaveTextContent('?open=1&verified=1')
    })

    it('filters by type from the rail, and clears with All', async () => {
      const searches = await ready()
      await userEvent.click(screen.getByRole('button', { name: 'Embassy' }))
      await waitFor(() => expect(lastSearch(searches).get('types')).toBe('embassy'))
      expect(screen.getByTestId('url')).toHaveTextContent('?types=embassy')
      await userEvent.click(screen.getByRole('button', { name: 'All' }))
      await waitFor(() => expect(lastSearch(searches).has('types')).toBe(false))
      expect(screen.getByTestId('url')).toBeEmptyDOMElement()
    })

    it('changes the order with the sort chips', async () => {
      const searches = await ready()
      await userEvent.click(within(panel()).getByRole('button', { name: 'Recently added' }))
      await waitFor(() => expect(lastSearch(searches).get('sort')).toBe('recent'))
      expect(screen.getByTestId('url')).toHaveTextContent('?sort=recent')
    })

    it('opens the filters sheet from "More filters", counts there and applies the draft to the list', async () => {
      const searches = await ready()
      await userEvent.click(screen.getByRole('button', { name: 'More filters' }))
      const sheet = screen.getByRole('dialog', { name: 'Filters' })
      expect(await within(sheet).findByRole('button', { name: 'Show 3 places' })).toBeInTheDocument()
      // The count is asked for the area on the map, with a bigger page than the list's — and for the destination only.
      expect(lastSearch(searches).get('limit')).toBe('200')
      expect(lastSearch(searches).get('location_country_id')).toBe(germany.id)
      expect(lastSearch(searches).get('founder_country_id')).toBe(russia.id)

      await userEvent.click(within(sheet).getByRole('button', { name: 'Official' }))
      await userEvent.click(within(sheet).getByRole('button', { name: 'Verified only' }))
      await userEvent.click(await within(sheet).findByRole('button', { name: 'Show 3 places' }))

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      await waitFor(() => expect(lastSearch(searches).get('added_by')).toBe('official'))
      expect(lastSearch(searches).get('verified')).toBe('true')
      expect(lastSearch(searches).get('limit')).toBe('100')
      expect(screen.getByTestId('url')).toHaveTextContent('?verified=1&by=official')
      expect(screen.getByRole('button', { name: 'More filters · 2' })).toBeInTheDocument()
    })

    it('drops the draft when the sheet is closed, and starts every time from the filters in force', async () => {
      await ready()
      await userEvent.click(screen.getByRole('button', { name: 'More filters' }))
      await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Official' }))
      await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.getByTestId('url')).toBeEmptyDOMElement()

      await userEvent.click(screen.getByRole('button', { name: 'More filters' }))
      expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Official' })).toHaveAttribute('aria-pressed', 'false')
    })

    it('opens the same sheet from the filters button on tablet and phone', async () => {
      for (const [width, name] of [[834, 'Filters'], [375, 'Filters']] as const) {
        setViewportWidth(width)
        arrange()
        const { unmount } = open()
        await screen.findByTestId('map')
        await userEvent.click(screen.getByRole('button', { name }))
        expect(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument()
        unmount()
      }
    })

    it('starts from the filters in the URL', async () => {
      const searches = arrange()
      open('/map?types=embassy&lang=Russian&open=1&rating=4&by=official&sort=verified')
      await screen.findByTestId('map')
      await rest()
      await waitFor(() => expect(searches).toHaveLength(1))
      expect(query(searches[0])).toMatchObject({ types: 'embassy', languages: 'Russian', open_now: 'true', min_rating: '4', added_by: 'official', sort: 'verified' })
      expect(screen.getByRole('button', { name: 'More filters · 5' })).toBeInTheDocument()
    })

    it('resets the filters from the empty result, keeping the sort order', async () => {
      const searches = arrange({ places: [] })
      open('/map?open=1&sort=recent')
      await screen.findByTestId('map')
      await rest()
      await userEvent.click(await within(panel()).findByRole('button', { name: 'Reset filters' }))
      await waitFor(() => expect(lastSearch(searches).has('open_now')).toBe(false))
      expect(lastSearch(searches).get('sort')).toBe('recent')
      expect(screen.getByTestId('url')).toHaveTextContent('?sort=recent')
      expect(await within(panel()).findByText('No organizations here yet.')).toBeInTheDocument()
    })
  })

  describe('selecting a place', () => {
    it('highlights the row and the pin, pans to the place and clears on a map click', async () => {
      await ready()
      await userEvent.click(within(panel()).getByRole('button', { name: /Russian Embassy/ }))
      expect(map.panTo).toHaveBeenCalledWith({ lat: 52.5, lng: 13.4 })
      expect(within(panel()).getByRole('button', { name: /Russian Embassy/ })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByText('Russian Embassy', { selector: '[aria-hidden=true]' })).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'click the map' }))
      expect(within(panel()).getByRole('button', { name: /Russian Embassy/ })).toHaveAttribute('aria-pressed', 'false')
    })

    it('selects from a pin too, without moving the map', async () => {
      await ready()
      await userEvent.click(screen.getByTitle('Pop-up fair'))
      expect(within(panel()).getByRole('button', { name: /Pop-up fair/ })).toHaveAttribute('aria-pressed', 'true')
      expect(map.panTo).not.toHaveBeenCalled()
    })

    it('does not pan to a place without a point', async () => {
      await ready()
      await userEvent.click(within(panel()).getByRole('button', { name: /Online only/ }))
      expect(map.panTo).not.toHaveBeenCalled()
      expect(within(panel()).getByRole('button', { name: /Online only/ })).toHaveAttribute('aria-pressed', 'true')
    })

    it('does not pan before the map exists', async () => {
      vi.mocked(useMap).mockReturnValue(null)
      await ready()
      await userEvent.click(within(panel()).getByRole('button', { name: /Russian Embassy/ }))
      expect(map.panTo).not.toHaveBeenCalled()
    })
  })

  describe('the corridor summary', () => {
    it('guest: the places of the destination and its two biggest types, no "new this week"', async () => {
      await ready()
      const bubble = screen.getByRole('button', { name: /73 places/ })
      expect(within(bubble).getByText('Business 30 · Embassy 8')).toBeInTheDocument()
      expect(within(bubble).queryByText(/new this week/)).not.toBeInTheDocument()
    })

    it('opens the corridor picker when the summary is clicked', async () => {
      await ready()
      await userEvent.click(screen.getByRole('button', { name: /73 places/ }))
      expect(screen.getByRole('dialog', { name: 'Choose your corridor' })).toBeInTheDocument()
    })

    it('names the types as the backend does, by count, and falls back to the slug for an unknown one', async () => {
      const byType = [{ slug: 'helper', count: 2 }, { slug: 'business', count: 9 }, { slug: 'volunteer', count: 5 }]
      await ready(arrange({ details: { [germany.id]: detail(germany, { placesByType: byType, totalPlaces: 16 }) } }))
      expect(within(screen.getByRole('button', { name: /16 places/ })).getByText('Business 9 · volunteer 5')).toBeInTheDocument()
    })

    it('has no types line for a destination without places', async () => {
      await ready(arrange({ details: { [germany.id]: detail(germany, { placesByType: [], totalPlaces: 0 }) } }))
      const bubble = screen.getByRole('button', { name: /0 places/ })
      expect(bubble).not.toHaveTextContent('·')
    })

    it('signed in: the figures of the saved corridor, with what is new this week', async () => {
      useAuthStore.getState().setAuth(authUser())
      const home = corridor({ fromCountryId: russia.id, toCountryId: germany.id, isDefault: true })
      capture('get', '/api/user/me', userProfile())
      capture('get', '/api/corridor/list', list([home]))
      capture('get', `/api/corridor/stats/${home.id}`, { corridorId: home.id, fromCountryId: russia.id, toCountryId: germany.id, totalPlaces: 234, newThisWeek: 12, byType: [{ slug: 'embassy', count: 4 }] })
      capture('get', '/api/saved/list', list([]))
      await ready()
      const bubble = await screen.findByRole('button', { name: /234 places/ })
      expect(within(bubble).getByText('Embassy 4 · 12 new this week')).toBeInTheDocument()
    })
  })

  describe('signed in', () => {
    it('saves and unsaves places with the bookmarks', async () => {
      useAuthStore.getState().setAuth(authUser())
      capture('get', '/api/user/me', userProfile())
      capture('get', '/api/corridor/list', list([corridor({ fromCountryId: russia.id, toCountryId: germany.id, isDefault: true })]))
      capture('get', '/api/saved/list', list([savedItem({ id: 'saved-1', kind: 'org', targetId: embassy.id })]))
      const created = capture('post', '/api/saved/create', savedItem())
      const removed = capture('delete', '/api/saved/delete/saved-1')
      await ready()
      expect(await within(panel()).findByRole('button', { name: 'Remove Russian Embassy from saved' })).toHaveAttribute('aria-pressed', 'true')
      await userEvent.click(within(panel()).getByRole('button', { name: 'Save Pop-up fair' }))
      await waitFor(() => expect(created).toHaveLength(1))
      expect(created[0].body).toEqual({ kind: 'org', target_id: untyped.id })
      await userEvent.click(within(panel()).getByRole('button', { name: 'Remove Russian Embassy from saved' }))
      await waitFor(() => expect(removed).toHaveLength(1))
    })

    it('guest: no bookmarks', async () => {
      await ready()
      expect(within(panel()).queryByRole('button', { name: /^Save / })).not.toBeInTheDocument()
    })
  })

  describe('sizes', () => {
    it('tablet: the results below the map, the controls and the summary over it', async () => {
      setViewportWidth(834)
      arrange()
      open()
      await screen.findByTestId('map')
      await rest()
      const results = await screen.findByRole('region', { name: 'Places on the map' })
      expect(await within(results).findByText('Russian Embassy')).toBeInTheDocument()
      expect(within(results).getByRole('heading', { level: 2, name: '3 organizations' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /73 places/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument()
    })

    it('phone: floating search and corridor pill, the results in a sheet that opens, selection closes it', async () => {
      setViewportWidth(375)
      arrange()
      open()
      await screen.findByTestId('map')
      await rest()
      expect(screen.getByRole('searchbox')).toHaveAttribute('placeholder', 'Search in Germany')
      expect(screen.getByRole('button', { name: /Germany/ })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Zoom in' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /73 places/ })).not.toBeInTheDocument()
      expect(await screen.findByText('3 nearby')).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Show the list' }))
      expect(screen.getByRole('button', { name: 'Hide the list' })).toHaveAttribute('aria-expanded', 'true')
      await userEvent.click(within(screen.getByRole('region', { name: 'Places on the map' })).getByRole('button', { name: /Russian Embassy/ }))
      expect(screen.getByRole('button', { name: 'Show the list' })).toHaveAttribute('aria-expanded', 'false')
      expect(map.panTo).toHaveBeenCalled()
    })

    it('phone: says the list is loading in the sheet header', async () => {
      setViewportWidth(375)
      arrange()
      open()
      await screen.findByTestId('map')
      expect(screen.getAllByText('Loading organizations…').length).toBeGreaterThan(0)
    })
  })
})
