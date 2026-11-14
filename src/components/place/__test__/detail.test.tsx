import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import { authUser, image, list, organisation, review, savedItem } from '@/test/factories'
import { renderApp } from '@/test/render'
import { capture } from '@/test/server'
import type { CountryConnection, OrganisationType } from '@/types/api'
import { ConsularNetwork } from '../ConsularNetwork'
import { COPIED_FEEDBACK_MS, PlaceActions } from '../PlaceActions'
import { PlaceAddedBy } from '../PlaceAddedBy'
import { PlaceCommunity } from '../PlaceCommunity'
import { PlaceCompactPanel } from '../PlaceCompactPanel'
import { PlaceContacts } from '../PlaceContacts'
import { PlaceHead } from '../PlaceHead'
import { PlaceHours } from '../PlaceHours'
import { PlaceMiniMap } from '../PlaceMiniMap'
import { PlacePhotos } from '../PlacePhotos'
import { PlaceReviews } from '../PlaceReviews'

vi.mock('@vis.gl/react-google-maps', async () => {
  const { createElement } = await import('react')
  return {
    Map: ({ children, defaultCenter, defaultZoom }: { children: ReactNode; defaultCenter: object; defaultZoom: number }) =>
      createElement('div', { 'data-testid': 'mini-map', 'data-view': JSON.stringify({ defaultCenter, defaultZoom }) }, children),
    AdvancedMarker: ({ children, title }: { children: ReactNode; title: string }) => createElement('div', { title }, children),
  }
})

const embassyType: OrganisationType = { id: 'type-embassy', type: 'embassy', slug: 'embassy', title: 'Embassy', color: null }
const ago = (ms: number) => new Date(Date.now() - ms).toISOString()
const HOUR = 3_600_000

function Probe() {
  const location = useLocation()
  return <output data-testid="path">{`${location.pathname}|${JSON.stringify(location.state)}`}</output>
}

const show = (ui: ReactNode, route = '/place/o1') =>
  renderApp(
    <>
      <Routes>
        <Route path="*" element={ui} />
      </Routes>
      <Probe />
    </>,
    { route },
  )

beforeEach(async () => {
  await i18n.changeLanguage('en')
})

describe('PlaceHead', () => {
  it('shows the type, verified and moderation badges, the address, open state, rating and visits', () => {
    const place = organisation({ name: 'Embassy', status: 'pending', verified: true, address: 'Deligradska 32', ratingAvg: 4.2, reviewsCount: 148, visitsCount: 1240, openNow: true })
    show(<PlaceHead place={place} type={embassyType} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Embassy' })).toBeInTheDocument()
    expect(screen.getAllByText('Embassy').length).toBeGreaterThan(1)
    expect(screen.getByText('Verified')).toBeInTheDocument()
    expect(screen.getByText('Pending review')).toBeInTheDocument()
    expect(screen.getByText('Deligradska 32')).toBeInTheDocument()
    expect(screen.getByText('1,240 visits')).toBeInTheDocument()
    expect(screen.getByText('Open now')).toBeInTheDocument()
  })

  it('names a type without a title by its key, and shows no address line without one', () => {
    show(<PlaceHead place={organisation({ name: 'Club', address: null, city: null })} type={{ ...embassyType, title: null, type: 'club' }} />)
    expect(screen.getByText('club')).toBeInTheDocument()
    expect(screen.queryByText('Berlin')).not.toBeInTheDocument()
  })

  it('falls back to the city, and shows a live place without badges or open state', () => {
    show(<PlaceHead place={organisation({ name: 'Cafe', city: 'Berlin', visitsCount: 1 })} type={undefined} compact as="h2" />)
    expect(screen.getByRole('heading', { level: 2, name: 'Cafe' })).toBeInTheDocument()
    expect(screen.getByText('Berlin')).toBeInTheDocument()
    expect(screen.getByText('1 visit')).toBeInTheDocument()
    expect(screen.queryByText('Verified')).not.toBeInTheDocument()
    expect(screen.queryByText(/Open|Closed/)).not.toBeInTheDocument()
  })
})

describe('PlaceActions', () => {
  afterEach(() => vi.useRealTimers())

  it('links to directions in a new tab and copies the page link, saying so for a moment', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    show(<PlaceActions place={organisation({ id: 'o1', latitude: 44.8, longitude: 20.46 })} />)
    expect(screen.getByRole('link', { name: 'Directions' })).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('link', { name: 'Directions' }).getAttribute('href')).toContain('destination=44.8%2C20.46')

    vi.useFakeTimers({ shouldAdvanceTime: true })
    await userEvent.click(screen.getByRole('button', { name: 'Copy link to this place' }))
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/place/o1`)
    expect(screen.getByRole('button', { name: 'Link copied' })).toBeInTheDocument()
    await act(() => vi.advanceTimersByTimeAsync(COPIED_FEEDBACK_MS))
    expect(screen.getByRole('button', { name: 'Copy link to this place' })).toBeInTheDocument()
  })

  it('stays as it was when the clipboard refuses', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
    show(<PlaceActions place={organisation({ id: 'o1' })} />)
    await userEvent.click(screen.getByRole('button', { name: 'Copy link to this place' }))
    expect(screen.getByRole('button', { name: 'Copy link to this place' })).toBeInTheDocument()
  })

  it('sends a guest who saves to sign in, and back here afterwards', async () => {
    show(<PlaceActions place={organisation({ latitude: null, longitude: null, address: null, city: null })} />, '/place/o1?x=1')
    expect(screen.queryByRole('link', { name: 'Directions' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/signin|{"from":{"pathname":"/place/o1","search":"?x=1"}}')
  })

  it('saves and unsaves for a signed-in user', async () => {
    useAuthStore.getState().setAuth(authUser())
    const place = organisation({ id: 'o1' })
    capture('get', '/api/saved/list', list([savedItem({ id: 's1', kind: 'org', targetId: 'o1' })]))
    const removed = capture('delete', '/api/saved/delete/s1', 'OK')
    show(<PlaceActions place={place} />)
    const saved = await screen.findByRole('button', { name: 'Saved' })
    expect(saved).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(saved)
    await waitFor(() => expect(removed).toHaveLength(1))
  })
})

describe('PlaceContacts', () => {
  it('links every contact the place has', () => {
    show(<PlaceContacts place={{ tel: '+49 30 1', email: 'a@b.test', website: 'example.org/', telegram: '@land', whatsapp: '+381 64' }} />)
    const contacts = within(screen.getByRole('list', { name: 'Contacts' }))
    expect(contacts.getByRole('link', { name: '+49 30 1' })).toHaveAttribute('href', 'tel:+49301')
    expect(contacts.getByRole('link', { name: 'a@b.test' })).toHaveAttribute('href', 'mailto:a@b.test')
    expect(contacts.getByRole('link', { name: 'example.org' })).toHaveAttribute('href', 'https://example.org/')
    expect(contacts.getByRole('link', { name: '@land' })).toHaveAttribute('href', 'https://t.me/land')
    expect(contacts.getByRole('link', { name: '+381 64' })).toHaveAttribute('href', 'https://wa.me/38164')
  })

  it('renders nothing without contacts', () => {
    show(<PlaceContacts place={{ tel: null, email: null, website: null, telegram: null, whatsapp: null }} />)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})

describe('PlaceHours', () => {
  it('lists the week Monday first, closed days included, with the time zone', () => {
    show(<PlaceHours place={{ openingHours: { mon: [['09:00', '13:00'], ['14:00', '18:00']], sat: [] }, timezone: 'Europe/Belgrade' }} />)
    expect(screen.getByText('Mon').nextSibling).toHaveTextContent('09:00–13:00, 14:00–18:00')
    expect(screen.getByText('Sat').nextSibling).toHaveTextContent('Closed')
    expect(screen.getByText('Sun').nextSibling).toHaveTextContent('Closed')
    expect(screen.getByText('Local time · Europe/Belgrade')).toBeInTheDocument()
  })

  it('renders nothing without hours, and no zone line without a zone', () => {
    const { unmount } = show(<PlaceHours place={{ openingHours: null, timezone: 'Europe/Berlin' }} />)
    expect(screen.queryByText('Mon')).not.toBeInTheDocument()
    unmount()
    show(<PlaceHours place={{ openingHours: { tue: [['10:00', '11:00']] }, timezone: null }} />)
    expect(screen.queryByText(/Local time/)).not.toBeInTheDocument()
  })
})

describe('PlaceCommunity', () => {
  it('shows the share still active, the check-ins, the latest one and the tips with their authors', () => {
    show(
      <PlaceCommunity
        community={{
          peopleCame: 3,
          stillActivePct: 67,
          lastCheckinAt: ago(2 * HOUR),
          tips: [
            { text: 'Book online', createdAt: ago(HOUR), author: { username: 'pavel', name: 'Pavel K.', avatarColor: null } },
            { text: 'Bring copies', createdAt: ago(HOUR), author: { username: 'olga', name: null, avatarColor: null } },
            { text: 'Come early', createdAt: ago(HOUR), author: null },
          ],
        }}
      />,
    )
    expect(screen.getByText('67%')).toBeInTheDocument()
    expect(screen.getByText('check-ins')).toBeInTheDocument()
    expect(screen.getByText('2 hours ago')).toBeInTheDocument()
    const tips = within(screen.getByRole('list', { name: 'Tips from visitors' }))
    expect(tips.getByText('— Pavel K., 1 hour ago')).toBeInTheDocument()
    expect(tips.getByText('— olga, 1 hour ago')).toBeInTheDocument()
    expect(tips.getByText('— a visitor, 1 hour ago')).toBeInTheDocument()
  })

  it('says there are no check-ins, and leaves out what is unknown', () => {
    const { unmount } = show(<PlaceCommunity community={{ peopleCame: 0, stillActivePct: null, lastCheckinAt: null, tips: [] }} />)
    expect(screen.getByText('No check-ins yet.')).toBeInTheDocument()
    unmount()
    show(<PlaceCommunity community={{ peopleCame: 1, stillActivePct: null, lastCheckinAt: null, tips: [] }} />)
    expect(screen.getByText('check-in')).toBeInTheDocument()
    expect(screen.queryByText(/still active/)).not.toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})

describe('PlaceReviews', () => {
  const summary = { count: 3, ratingAvg: 4, byRating: [5, 4, 3, 2, 1].map((rating) => ({ rating, count: rating >= 3 ? 1 : 0 })) }

  it('shows the average, the breakdown and the latest reviews with their authors', async () => {
    capture('get', '/api/review/summary', summary)
    const listed = capture(
      'get',
      '/api/review/list',
      list([
        review({ rating: 5, text: 'Fast', author: { username: 'pavel', name: 'Pavel K.', avatarColor: '#4F7F5C' } }),
        review({ rating: 3, text: null, author: null }),
        review({ rating: 4, text: null, author: { username: 'olga', name: null, avatarColor: null } }),
      ]),
    )
    show(<PlaceReviews organisationId="o1" limit={2} />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(await screen.findByText('4.0')).toBeInTheDocument()
    expect(screen.getByText('3 reviews')).toBeInTheDocument()
    expect(within(screen.getByRole('list', { name: 'Reviews by rating' })).getAllByRole('listitem')[0]).toHaveAccessibleName('Rating 5: 1 review')
    const latest = within(screen.getByRole('list', { name: 'Latest reviews' }))
    expect(latest.getByText('Pavel K.')).toBeInTheDocument()
    expect(latest.getByText('Fast')).toBeInTheDocument()
    expect(latest.getByText('Former member')).toBeInTheDocument()
    expect(latest.getByText('olga')).toBeInTheDocument()
    expect(listed[0].query.get('limit')).toBe('2')
  })

  it('compact: the average without the breakdown', async () => {
    capture('get', '/api/review/summary', summary)
    capture('get', '/api/review/list', list([]))
    show(<PlaceReviews organisationId="o1" limit={2} compact />)
    expect(await screen.findByText('4.0')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Reviews by rating' })).not.toBeInTheDocument()
  })

  it('says when there are none, or they could not be loaded', async () => {
    capture('get', '/api/review/summary', { count: 0, ratingAvg: null, byRating: [] })
    capture('get', '/api/review/list', list([]))
    const { unmount } = show(<PlaceReviews organisationId="o1" limit={3} />)
    expect(await screen.findByText('No reviews yet.')).toBeInTheDocument()
    unmount()
    capture('get', '/api/review/summary', { error: 'boom' }, 500)
    show(<PlaceReviews organisationId="o2" limit={3} />)
    expect(await screen.findByText("Couldn't load the reviews")).toBeInTheDocument()
  })
})

describe('PlaceAddedBy', () => {
  it('names who added the place and notes a point from Google', () => {
    show(<PlaceAddedBy place={{ creator: { username: 'maria', name: 'Maria A.', avatarColor: '#4A6D8C' }, locationSource: 'google' }} />)
    expect(screen.getByText('Maria A.')).toBeInTheDocument()
    expect(screen.getByText('@maria · added this place')).toBeInTheDocument()
    expect(screen.getByText('Location from Google Maps')).toBeInTheDocument()
  })

  it('falls back to the username, shows Google alone, or nothing', () => {
    const first = show(<PlaceAddedBy place={{ creator: { username: 'maria', name: null, avatarColor: null }, locationSource: 'user_pin' }} />)
    expect(screen.getByText('maria')).toBeInTheDocument()
    expect(screen.queryByText(/Google/)).not.toBeInTheDocument()
    first.unmount()
    const second = show(<PlaceAddedBy place={{ creator: undefined, locationSource: 'google' }} />)
    expect(screen.getByText('Location from Google Maps')).toBeInTheDocument()
    second.unmount()
    show(<PlaceAddedBy place={{ creator: undefined, locationSource: null }} />)
    expect(screen.queryByText(/Google|added/)).not.toBeInTheDocument()
  })
})

describe('ConsularNetwork', () => {
  const connection = (over: Partial<CountryConnection>): CountryConnection => ({ id: 'c', commonInfo: null, embassyOrgId: null, consulateOrgId: null, locationCountryId: null, embassy: null, consulate: null, ...over })
  const section = (links: ReactNode) => <section aria-label="Network">{links}</section>

  it("links an embassy's consulates and a consulate's embassy, by city or name", async () => {
    const lists = capture('get', '/api/country-connection/list', list([connection({ embassy: { id: 'e1', name: 'Embassy', city: 'Belgrade' }, consulate: { id: 'k1', name: 'Consulate in Niš', city: null } })]))
    show(<ConsularNetwork organisationId="o1">{section}</ConsularNetwork>)
    const network = within(await screen.findByRole('region', { name: 'Network' }))
    expect(network.getAllByRole('link', { name: 'Embassy · Belgrade' })[0]).toHaveAttribute('href', '/place/e1')
    expect(network.getAllByRole('link', { name: 'Consulate · Consulate in Niš' })[0]).toHaveAttribute('href', '/place/k1')
    await waitFor(() => expect(lists).toHaveLength(2))
    expect(lists.map((request) => [request.query.get('embassy_org_id'), request.query.get('consulate_org_id')])).toEqual(expect.arrayContaining([['o1', null], [null, 'o1']]))
  })

  it('lists a place linked by several connections once', async () => {
    const consulate = { id: 'k1', name: 'Consulate', city: 'Niš' }
    capture('get', '/api/country-connection/list', list([connection({ id: 'c1', consulate }), connection({ id: 'c2', consulate })]))
    show(<ConsularNetwork organisationId="o1">{section}</ConsularNetwork>)
    const network = within(await screen.findByRole('region', { name: 'Network' }))
    expect(network.getAllByRole('link', { name: 'Consulate · Niš' })).toHaveLength(1)
  })

  it('renders nothing without links (or with places not on the map)', async () => {
    const lists = capture('get', '/api/country-connection/list', list([connection({})]))
    show(<ConsularNetwork organisationId="o1">{section}</ConsularNetwork>)
    await waitFor(() => expect(lists).toHaveLength(2))
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
  })
})

describe('PlacePhotos', () => {
  it('shows the primary photo first', () => {
    show(<PlacePhotos placeName="Cafe" images={[image({ url: 'https://img/2', isPrimary: false }), image({ url: 'https://img/1', isPrimary: true })]} />)
    const photos = within(screen.getByRole('list', { name: 'Photos · 2' })).getAllByRole('img')
    expect(photos.map((photo) => photo.getAttribute('src'))).toEqual(['https://img/1', 'https://img/2'])
    expect(photos[0]).toHaveAccessibleName('Cafe, photo 1')
  })
})

describe('PlaceMiniMap', () => {
  it('shows the place on a still street map, or nothing without a point', () => {
    const { unmount } = show(<PlaceMiniMap place={organisation({ name: 'Cafe', latitude: 44.8, longitude: 20.4 })} type={embassyType} />)
    expect(JSON.parse(screen.getByTestId('mini-map').dataset.view!)).toEqual({ defaultCenter: { lat: 44.8, lng: 20.4 }, defaultZoom: 15 })
    expect(screen.getByTitle('Cafe')).toBeInTheDocument()
    unmount()
    show(<PlaceMiniMap place={organisation({ latitude: null, longitude: null, status: 'pending' })} type={undefined} />)
    expect(screen.queryByTestId('mini-map')).not.toBeInTheDocument()
  })
})

describe('PlaceCompactPanel', () => {
  it('shows the primary photo, the head, description, services, contacts and the way to the full page', async () => {
    capture('get', '/api/images/list/o1', list([image({ url: 'https://img/other' }), image({ url: 'https://img/primary', isPrimary: true })]))
    const onClose = vi.fn()
    show(<PlaceCompactPanel place={organisation({ id: 'o1', name: 'Cafe', description: 'Cosy', services: ['Wi-Fi'], tel: '+1' })} type={undefined} showPhoto onClose={onClose} />)
    const panel = within(screen.getByRole('region', { name: 'Cafe' }))
    expect(await panel.findByRole('img', { name: 'Photo of Cafe' })).toHaveAttribute('src', 'https://img/primary')
    expect(panel.getByRole('heading', { level: 2, name: 'Cafe' })).toBeInTheDocument()
    expect(panel.getByText('Cosy')).toBeInTheDocument()
    expect(within(panel.getByRole('list', { name: 'Services' })).getByText('Wi-Fi')).toBeInTheDocument()
    expect(panel.getByRole('link', { name: '+1' })).toBeInTheDocument()
    expect(panel.getByRole('link', { name: 'Open full page' })).toHaveAttribute('href', '/place/o1')
    await userEvent.click(panel.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('takes the first photo without a primary one, and asks for none on phones', async () => {
    const images = capture('get', '/api/images/list/o1', list([image({ url: 'https://img/first' })]))
    const { unmount } = show(<PlaceCompactPanel place={organisation({ id: 'o1', name: 'Cafe' })} type={undefined} showPhoto onClose={vi.fn()} />)
    expect(await screen.findByRole('img', { name: 'Photo of Cafe' })).toHaveAttribute('src', 'https://img/first')
    unmount()
    show(<PlaceCompactPanel place={organisation({ id: 'o2', name: 'Bar' })} type={undefined} showPhoto={false} onClose={vi.fn()} />)
    expect(screen.queryByRole('img', { name: 'Photo of Bar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Services' })).not.toBeInTheDocument()
    expect(images).toHaveLength(1)
  })
})
