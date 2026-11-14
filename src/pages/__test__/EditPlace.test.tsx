import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { authUser, country, organisation } from '@/test/factories'
import { queryKeys } from '@/lib/queryKeys'
import { createTestQueryClient, renderApp } from '@/test/render'
import { API, capture, server } from '@/test/server'
import { setViewportWidth } from '@/test/viewport'
import EditPlacePage from '../EditPlacePage'

vi.mock('@vis.gl/react-google-maps', async () => {
  const { createElement } = await import('react')
  return {
    useMapsLibrary: () => null,
    useMap: () => null,
    Map: ({ children }: { children?: ReactNode }) => createElement('div', { 'data-testid': 'map' }, children),
    AdvancedMarker: ({ children }: { children?: ReactNode }) => createElement('div', null, children),
  }
})

const serbia = country({ name: 'Serbia', flag: '🇷🇸' })
const ME = 'user-me'
const business = { id: 'type-business', type: 'business', slug: 'business', title: 'Business', color: null }

function Probe() {
  return <output data-testid="path">{useLocation().pathname}</output>
}

const open = () =>
  renderApp(
    <>
      <Routes>
        <Route path="/place/:id/edit" element={<EditPlacePage />} />
        <Route path="/place/:id" element={<p>The place page</p>} />
        <Route path="/map" element={<p>The map</p>} />
      </Routes>
      <Probe />
    </>,
    { route: '/place/my-place/edit' },
  )

const place = (over = {}) => organisation({ id: 'my-place', name: 'Svetofor', createdBy: ME, organisationTypeId: business.id, locationCountryId: serbia.id, founderCountryId: serbia.id, ...over })

beforeEach(() => {
  useAuthStore.getState().setAuth(authUser({ id: ME }))
  capture('get', '/api/common/countries', [serbia])
  capture('get', '/api/common/org_types', [business])
  capture('get', '/api/common/languages', [])
  capture('get', '/api/common/timezone', { timezone: 'Europe/Belgrade' })
  server.use(http.get(`${API}/api/common/countries/:id`, () => HttpResponse.json({ ...serbia, geoJson: null, totalPlaces: 0, placesByType: [] })))
})

describe('EditPlacePage', () => {
  it('opens the place the user added in the form and returns to its page after saving', async () => {
    capture('get', '/api/organisation/fetch/my-place', place())
    const saved = capture('put', '/api/organisation/update/my-place', place({ name: 'Svetofor Market' }))
    open()
    expect(await screen.findByRole('heading', { name: 'Edit place' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Svetofor'))

    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), ' Market')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(saved).toHaveLength(1))
    expect(saved[0].body).toMatchObject({ name: 'Svetofor Market' })
    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/place/my-place'))
    expect(await screen.findByText('The place page')).toBeInTheDocument()
  })

  it('has a close header on a phone that goes back to the place', async () => {
    setViewportWidth(375)
    capture('get', '/api/organisation/fetch/my-place', place())
    open()
    await userEvent.click(await screen.findByRole('button', { name: 'Close' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/place/my-place')
  })

  it('waits while the place loads', () => {
    server.use(http.get(`${API}/api/organisation/fetch/my-place`, () => new Promise(() => {})))
    open()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('starts from what the server says now, not from the copy the place page cached', async () => {
    capture('get', '/api/organisation/fetch/my-place', place({ name: 'Svetofor (new)' }))
    const client = createTestQueryClient()
    client.setQueryData(queryKeys.organisations.detail('my-place'), place({ name: 'Svetofor (old)' }))
    renderApp(
      <Routes>
        <Route path="/place/:id/edit" element={<EditPlacePage />} />
      </Routes>,
      { route: '/place/my-place/edit', client },
    )
    expect(screen.getByText('Loading…')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Svetofor (new)'))
  })

  it('says the place could not be loaded — not that it is not theirs — and tries again', async () => {
    let calls = 0
    server.use(http.get(`${API}/api/organisation/fetch/my-place`, () => (++calls === 1 ? HttpResponse.json({ error: 'boom' }, { status: 500 }) : HttpResponse.json(place()))))
    open()
    await userEvent.click(await screen.findByRole('button', { name: 'Try again' }, { timeout: 5000 }))
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Svetofor'))
  })

  it.each([
    ['someone else added it', () => capture('get', '/api/organisation/fetch/my-place', place({ createdBy: 'someone-else' }))],
    ['it cannot be loaded', () => capture('get', '/api/organisation/fetch/my-place', { error: 'Not found' }, 404)],
  ])('says there is nothing to edit when %s', async (_name, arrange) => {
    arrange()
    open()
    expect(await screen.findByText("You can't edit this place")).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Name' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Back to the map' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/map')
  })
})
