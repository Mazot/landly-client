import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { authUser, corridor, country, image, list, organisation } from '@/test/factories'
import { renderApp } from '@/test/render'
import { API, capture, server } from '@/test/server'
import { setViewportWidth } from '@/test/viewport'
import AddPlacePage from '../AddPlacePage'
import AddPlaceSentPage from '../AddPlaceSentPage'

vi.mock('@vis.gl/react-google-maps', async () => {
  const { createElement } = await import('react')
  return {
    useMapsLibrary: () => null,
    useMap: () => null,
    Map: ({ children, onClick }: { children?: ReactNode; onClick: (event: unknown) => void }) =>
      createElement('div', { 'data-testid': 'map' }, createElement('button', { type: 'button', onClick: () => onClick({ detail: { latLng: { lat: 44.81, lng: 20.46 } } }) }, 'tap the map'), children),
    AdvancedMarker: ({ children }: { children?: ReactNode }) => createElement('div', null, children),
  }
})

const russia = country({ name: 'Russia', flag: '🇷🇺' })
const serbia = country({ name: 'Serbia', flag: '🇷🇸' })
const ME = 'user-me'

function Probe() {
  return <output data-testid="path">{useLocation().pathname}</output>
}

const open = (route: string) =>
  renderApp(
    <>
      <Routes>
        <Route path="/add" element={<AddPlacePage />} />
        <Route path="/add/sent/:id" element={<AddPlaceSentPage />} />
        <Route path="/map" element={<p>The map</p>} />
      </Routes>
      <Probe />
    </>,
    { route },
  )

beforeEach(() => {
  useAuthStore.getState().setAuth(authUser({ id: ME }))
  capture('get', '/api/user/me', {})
  capture('get', '/api/common/countries', [russia, serbia])
  capture('get', '/api/common/org_types', [{ id: 'type-business', type: 'business', slug: 'business', title: 'Business', color: null }])
  capture('get', '/api/common/languages', [])
  capture('get', '/api/common/timezone', { timezone: 'Europe/Belgrade' })
  capture('get', '/api/organisation/duplicates', list([]))
  capture('get', '/api/corridor/list', list([]))
  server.use(http.get(`${API}/api/common/countries/:id`, () => HttpResponse.json({ ...serbia, geoJson: null, totalPlaces: 0, placesByType: [] })))
})

describe('AddPlacePage', () => {
  it('starts on the corridor the user browses and goes on to "sent" after the submission', async () => {
    capture('get', '/api/corridor/list', list([corridor({ fromCountryId: russia.id, toCountryId: serbia.id, isDefault: true })]))
    const created = capture('post', '/api/organisation/create', organisation({ id: 'new-place', name: 'Corner shop', status: 'pending' }))
    capture('get', '/api/organisation/fetch/new-place', organisation({ id: 'new-place', name: 'Corner shop', status: 'pending' }))
    open('/add')
    expect(await screen.findByRole('heading', { name: 'Add a place' })).toBeInTheDocument()
    expect(screen.getByText('New places appear on the map right away, marked as pending review until a moderator checks them — usually within a day.')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Located in' })).toHaveValue(serbia.id))
    expect(screen.getByRole('combobox', { name: 'Community from' })).toHaveValue(russia.id)

    await userEvent.click(screen.getAllByRole('button', { name: 'tap the map' })[0])
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'Corner shop')
    await userEvent.click(await screen.findByRole('button', { name: 'Business' }))
    await userEvent.click(screen.getByRole('button', { name: 'Submit for review' }))

    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/add/sent/new-place'))
    expect(created[0].body).toMatchObject({ location_country_id: serbia.id, founder_country_id: russia.id })
  })

  it('says it is loading while the corridor is unknown', async () => {
    server.use(http.get(`${API}/api/corridor/list`, () => new Promise(() => {})))
    open('/add')
    expect(await screen.findByText('Loading…')).toBeInTheDocument()
  })

  it('has a close button instead of the page header on phones', async () => {
    setViewportWidth(375)
    capture('get', '/api/corridor/list', list([]))
    open('/add')
    expect(screen.queryByRole('heading', { name: 'Add a place', level: 1 })).not.toBeInTheDocument()
    await userEvent.click(screen.getAllByRole('button', { name: /Close|Back/ })[0])
    expect(screen.getByTestId('path')).toHaveTextContent('/map')
  })
})

describe('AddPlaceSentPage', () => {
  const place = organisation({ id: 'p1', name: 'Corner shop', status: 'pending', createdBy: ME })

  it('says the place waits for review and what happens next', async () => {
    capture('get', '/api/organisation/fetch/p1', place)
    open('/add/sent/p1')
    expect(await screen.findByRole('heading', { name: 'Sent for review' })).toBeInTheDocument()
    expect(screen.getByText('Corner shop')).toBeInTheDocument()
    expect(screen.getByText('Status: pending')).toBeInTheDocument()
    expect(screen.getByText('Moderator review')).toBeInTheDocument()
    expect(screen.getByText('Approved')).toBeInTheDocument()
    expect(screen.getByText(/is already on the map, marked as pending review/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Back to the map' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/map')
  })

  it('shows nothing for a place that cannot be loaded or was submitted by someone else', async () => {
    capture('get', '/api/organisation/fetch/p1', { error: 'Not found' }, 404)
    const { unmount } = open('/add/sent/p1')
    expect(await screen.findByText('Nothing to show here')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add photos' })).not.toBeInTheDocument()
    unmount()

    capture('get', '/api/organisation/fetch/p1', { ...place, createdBy: 'someone-else' })
    open('/add/sent/p1')
    expect(await screen.findByText('This page is for a place you have just submitted.')).toBeInTheDocument()
    expect(screen.queryByText('Corner shop')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add photos' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Back to the map' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/map')
  })

  it('uploads photos — the first that arrives is the primary — and counts the ones that failed', async () => {
    capture('get', '/api/organisation/fetch/p1', place)
    let calls = 0
    const primary: (string | undefined)[] = []
    server.use(
      http.post(`${API}/api/images/upload/p1`, async ({ request }) => {
        calls += 1
        primary.push(/name="is_primary"\r\n\r\n(\w+)/.exec(await request.text())?.[1])
        return calls === 1 ? HttpResponse.json({ error: 'Too large' }, { status: 422 }) : HttpResponse.json(image())
      }),
    )
    open('/add/sent/p1')
    await userEvent.click(await screen.findByRole('button', { name: 'Add photos' }))
    expect(screen.queryByRole('button', { name: 'Add photos' })).not.toBeInTheDocument()
    const files = ['a.png', 'b.png', 'c.png'].map((name) => new File(['x'], name, { type: 'image/png' }))
    await userEvent.upload(document.querySelector('input[type="file"]') as HTMLInputElement, files)

    expect(await screen.findByText('2 photos added')).toBeInTheDocument()
    expect(screen.getByText("1 photo couldn't be added")).toBeInTheDocument()
    // The first file failed: the second becomes the cover, not none.
    expect(primary).toEqual(['true', 'true', 'false'])
  })

  it('says how many files were refused before uploading', async () => {
    capture('get', '/api/organisation/fetch/p1', place)
    open('/add/sent/p1')
    await userEvent.click(await screen.findByRole('button', { name: 'Add photos' }))
    await userEvent.upload(document.querySelector('input[type="file"]') as HTMLInputElement, [new File(['x'], 'notes.pdf', { type: 'application/pdf' })], { applyAccept: false })
    expect(await screen.findByText("1 photo couldn't be added")).toBeInTheDocument()
  })
})
