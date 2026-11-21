import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { authUser, corridor, country, list, person, review } from '@/test/factories'
import { renderApp } from '@/test/render'
import { API, capture, server } from '@/test/server'
import { setViewportWidth } from '@/test/viewport'
import PeoplePage from '../PeoplePage'
import PersonPage from '../PersonPage'
import RecommendPage from '../RecommendPage'

const russia = country({ id: 'ru', name: 'Russia', flag: '🇷🇺' })
const germany = country({ id: 'de', name: 'Germany', flag: '🇩🇪' })
const skills = [
  { id: 's1', name: 'Housing' },
  { id: 's2', name: 'Banking' },
]
const languages = [
  { id: 'l-ru', name: 'Russian', symbol: 'rus' },
  { id: 'l-de', name: 'German', symbol: 'deu' },
]

function Probe() {
  const location = useLocation()
  return <output data-testid="path">{location.pathname + location.search}</output>
}

const open = (route: string) =>
  renderApp(
    <>
      <Routes>
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/people/recommend" element={<RecommendPage />} />
        <Route path="/people/:id" element={<PersonPage />} />
        <Route path="/account" element={<p>The account</p>} />
        <Route path="/signin" element={<p>Sign in</p>} />
      </Routes>
      <Probe />
    </>,
    { route },
  )

beforeEach(() => {
  capture('get', '/api/common/countries', [russia, germany])
  capture('get', '/api/person/skills', list(skills))
  capture('get', '/api/common/languages', languages)
  capture('get', '/api/common/org_types', [])
  capture('get', '/api/corridor/list', list([corridor({ fromCountryId: russia.id, toCountryId: germany.id, isDefault: true })]))
  capture('get', '/api/user/me', {})
})

describe('PeoplePage', () => {
  const helpers = [person({ id: 'p1', name: 'Igor Petrov', city: 'Berlin', skills: ['Housing'], status: 'claimed' }), person({ id: 'p2', name: 'Olga Sidorova', city: 'Hamburg', skills: ['Banking'] })]

  it('lists the helpers of the corridor’s country, named after it', async () => {
    const requests = capture('get', '/api/person/list', list(helpers))
    open('/people')
    expect(await screen.findByRole('heading', { name: 'Helpers in Germany' })).toBeInTheDocument()
    const rows = within(await screen.findByRole('list', { name: 'Helpers' }))
    expect(rows.getByRole('link', { name: /Igor Petrov/ })).toHaveAttribute('href', '/people/p1')
    expect(rows.getByRole('link', { name: /Olga Sidorova/ })).toBeInTheDocument()
    expect(screen.getByText('Everyone here confirmed their own profile and chose which contacts to show.')).toBeInTheDocument()
    expect(requests[0].query.get('location_country_id')).toBe('de')
    expect(screen.getByRole('link', { name: 'Recommend someone' })).toHaveAttribute('href', '/people/recommend')
  })

  it('narrows the list by the filters, which live in the address', async () => {
    const requests = capture('get', '/api/person/list', list(helpers))
    open('/people?skills=Banking')
    await screen.findByRole('list', { name: 'Helpers' })
    expect(screen.getByRole('button', { name: 'Banking' })).toHaveAttribute('aria-pressed', 'true')
    expect(requests[0].query.get('skills')).toBe('Banking')

    await userEvent.click(screen.getByRole('button', { name: 'Housing' }))
    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/people?skills=Banking%2CHousing'))
    await userEvent.type(screen.getByRole('textbox', { name: 'City' }), 'Ber')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Helpers in Ber' })).toBeInTheDocument())
    await waitFor(() => expect(requests.some((request) => request.query.get('city') === 'Ber')).toBe(true))
    // One request once the typing paused — not one per letter.
    expect(requests.filter((request) => ['B', 'Be'].includes(request.query.get('city') ?? ''))).toHaveLength(0)
  })

  it('shows more helpers a page at a time', async () => {
    const page = (names: string[]) => list(names.map((name) => person({ name })))
    let calls = 0
    server.use(
      http.get(`${API}/api/person/list`, () => {
        calls += 1
        return HttpResponse.json(calls === 1 ? page(Array.from({ length: 20 }, (_, i) => `Helper ${i}`)) : page(['Last helper']))
      }),
    )
    open('/people')
    await screen.findByRole('list', { name: 'Helpers' })
    await userEvent.click(await screen.findByRole('button', { name: 'Show more' }))
    expect(await screen.findByText('Last helper')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Show more' })).not.toBeInTheDocument()
  })

  it('invites to recommend when there is nobody, and says so when filters leave nobody', async () => {
    capture('get', '/api/person/list', list([]))
    const { unmount } = open('/people')
    expect(await screen.findByText('No helpers here yet')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Recommend someone' })).toHaveLength(2)
    unmount()
    open('/people?skills=Banking')
    expect(await screen.findByText('Nobody matches these filters. Try fewer.')).toBeInTheDocument()
  })

  it('says it is loading, and when the list cannot be loaded', async () => {
    server.use(http.get(`${API}/api/person/list`, () => new Promise(() => {})))
    const { unmount } = open('/people')
    expect(await screen.findByText('Loading helpers…')).toBeInTheDocument()
    unmount()
    server.use(http.get(`${API}/api/person/list`, () => HttpResponse.json({ error: 'boom' }, { status: 500 })))
    open('/people')
    expect(await screen.findByText("Couldn't load the helpers")).toBeInTheDocument()
  })

  it('is just "Helpers" without a corridor country', async () => {
    capture('get', '/api/corridor/list', list([]))
    capture('get', '/api/common/countries', [])
    capture('get', '/api/person/list', list([]))
    open('/people')
    expect(await screen.findByRole('heading', { name: 'Helpers' })).toBeInTheDocument()
  })

  it('keeps the filters in a sheet on a phone, with the recommend button under the list', async () => {
    setViewportWidth(375)
    capture('get', '/api/person/list', list(helpers))
    open('/people?skills=Banking')
    await screen.findByRole('list', { name: 'Helpers' })
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Filters · 1' }))
    const sheet = await screen.findByRole('dialog')
    await userEvent.click(within(sheet).getByRole('button', { name: 'Housing' }))
    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('skills=Banking%2CHousing'))
    await userEvent.click(within(sheet).getByRole('button', { name: 'Show helpers' }))
    expect(screen.getByRole('link', { name: 'Recommend someone' })).toBeInTheDocument()
    // The sheet's own close button leaves it too.
    await userEvent.click(screen.getByRole('button', { name: 'Filters · 1' }))
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('has its filters in a sheet on a tablet too, with a plain "Filters" button without any set', async () => {
    setViewportWidth(800)
    capture('get', '/api/person/list', list(helpers))
    open('/people')
    await screen.findByRole('list', { name: 'Helpers' })
    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument()
  })
})

describe('PersonPage', () => {
  const profile = person({
    id: 'p1',
    name: 'Igor Petrov',
    status: 'claimed',
    city: 'Berlin',
    bio: 'I help newcomers with Anmeldung.',
    skills: ['Housing', 'Paperwork'],
    languageIds: ['l-ru', 'l-de', 'l-unknown'],
    vouches: 3,
    ratingAvg: 4.5,
    reviewsCount: 1,
    whatsapp: '+49 176 1234 5678',
    recommendedBy: { username: 'anna', name: 'Anna Morozova', avatarColor: null },
  })
  const arrange = (shown = profile) => {
    capture('get', '/api/person/fetch/p1', shown)
    capture('get', '/api/review/summary', { count: 1, ratingAvg: 4.5, byRating: [5, 4, 3, 2, 1].map((rating) => ({ rating, count: rating === 5 ? 1 : 0 })) })
    capture('get', '/api/review/list', list([review({ id: 'r1', text: 'Very patient.', author: { username: 'viktor', name: 'Viktor Lenz', avatarColor: null } })]))
  }

  it('shows who the helper is, how they help, their languages, reviews and who recommended them', async () => {
    arrange()
    open('/people/p1')
    expect(await screen.findByRole('heading', { level: 1, name: 'Igor Petrov' })).toBeInTheDocument()
    expect(screen.getByText('Claimed')).toBeInTheDocument()
    expect(screen.getAllByText('Berlin').length).toBeGreaterThan(0)
    expect(screen.getByText('I help newcomers with Anmeldung.')).toBeInTheDocument()
    expect(within(screen.getByRole('list', { name: 'How they help' })).getAllByRole('listitem').map((item) => item.textContent)).toEqual(['Housing', 'Paperwork'])
    // A language id the reference list does not know is left out, not shown as an id.
    expect(within(await screen.findByRole('list', { name: 'Speaks' })).getAllByRole('listitem').map((item) => item.textContent)).toEqual(['Russian', 'German'])
    expect(await screen.findByText('Very patient.')).toBeInTheDocument()
    expect(screen.getByText('Anna Morozova')).toBeInTheDocument()
    expect(screen.getByText('Igor Petrov confirmed and claimed the profile')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /WhatsApp · \+49 176 1234 5678/ })).toBeInTheDocument()
    await userEvent.click(within(screen.getByRole('navigation', { name: 'Breadcrumbs' })).getByRole('link', { name: 'People' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/people')
  })

  it('has no reviews block when the person turned reviews off, and says confirmed (not claimed) for a plain confirmation', async () => {
    arrange(person({ ...profile, allowReviews: false, status: 'confirmed', recommendedBy: { username: 'anna', name: null, avatarColor: '#abc' }, bio: null, skills: [], languageIds: [] }))
    open('/people/p1')
    expect(await screen.findByRole('heading', { level: 1, name: 'Igor Petrov' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Reviews' })).not.toBeInTheDocument()
    expect(screen.getByText('Reviews off')).toBeInTheDocument()
    expect(screen.getByText('anna')).toBeInTheDocument()
    expect(screen.getByText('Igor Petrov confirmed the profile')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'How they help' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Speaks' })).not.toBeInTheDocument()
  })

  it('has no "recommended by" when the recommender is unknown', async () => {
    arrange(person({ ...profile, recommendedBy: undefined }))
    open('/people/p1')
    expect(await screen.findByRole('heading', { level: 1, name: 'Igor Petrov' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Recommended by' })).not.toBeInTheDocument()
  })

  it('puts the contacts card above the text on a phone, with a back header', async () => {
    setViewportWidth(375)
    arrange()
    open('/people/p1')
    expect(await screen.findByRole('heading', { level: 1, name: 'Igor Petrov' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Breadcrumbs' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/people')
  })

  it('says the helper does not exist for a 404, and offers to retry any other failure', async () => {
    capture('get', '/api/person/fetch/p1', { error: 'Not found' }, 404)
    const { unmount } = open('/people/p1')
    expect(await screen.findByText("This helper doesn't exist or isn't listed")).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Back to people' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/people')
    unmount()

    let calls = 0
    server.use(http.get(`${API}/api/person/fetch/p1`, () => (++calls === 1 ? HttpResponse.json({ error: 'boom' }, { status: 500 }) : HttpResponse.json(profile))))
    capture('get', '/api/review/summary', { count: 0, ratingAvg: null, byRating: [] })
    capture('get', '/api/review/list', list([]))
    open('/people/p1')
    await userEvent.click(await screen.findByRole('button', { name: 'Try again' }, { timeout: 5000 }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Igor Petrov' })).toBeInTheDocument()
  })

  it('says it is loading', async () => {
    server.use(http.get(`${API}/api/person/fetch/p1`, () => new Promise(() => {})))
    open('/people/p1')
    expect(await screen.findByText('Loading the profile…')).toBeInTheDocument()
  })
})

describe('RecommendPage', () => {
  beforeEach(() => useAuthStore.getState().setAuth(authUser()))

  it('opens the form, and goes to the account once the claim link was handed over', async () => {
    capture('post', '/api/person/create', { person: person({ name: 'Daria K.', status: 'pending' }), claimUrl: '/claim/tok', sendVia: 'whatsapp' })
    open('/people/recommend')
    expect(await screen.findByRole('heading', { name: 'Recommend someone' })).toBeInTheDocument()
    await userEvent.type(await screen.findByRole('textbox', { name: 'Name' }), 'Daria K.')
    await userEvent.type(screen.getByRole('textbox', { name: /How can they be reached/ }), '+49 157 4410 2290')
    await userEvent.click(screen.getByRole('checkbox', { name: /agreed/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Create claim link' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Close' }))
    expect(await screen.findByText('The account')).toBeInTheDocument()
  })

  it('waits for the corridor', async () => {
    server.use(http.get(`${API}/api/corridor/list`, () => new Promise(() => {})))
    open('/people/recommend')
    expect(await screen.findByText('Loading…')).toBeInTheDocument()
  })

  it('has a close header instead of the page title on a phone, which goes back to the people', async () => {
    setViewportWidth(375)
    open('/people/recommend')
    await screen.findByRole('textbox', { name: 'Name' })
    expect(screen.queryByRole('heading', { level: 1, name: 'Recommend someone' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/people')
  })
})
