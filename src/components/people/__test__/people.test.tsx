import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { authUser, country, list, person, savedItem } from '@/test/factories'
import { renderApp } from '@/test/render'
import { API, capture, server } from '@/test/server'
import type { PersonCreated } from '@/types/api'
import { ClaimLinkSheet, COPIED_FEEDBACK_MS } from '../ClaimLinkSheet'
import { PeopleFilters } from '../PeopleFilters'
import { PersonContacts } from '../PersonContacts'
import { PersonRow } from '../PersonRow'
import { RecommendForm } from '../RecommendForm'
import { SpokenLanguagesField } from '../SpokenLanguagesField'

const russian = { id: 'l-ru', name: 'Russian', symbol: 'rus' }
const german = { id: 'l-de', name: 'German', symbol: 'deu' }
const serbian = { id: 'l-sr', name: 'Serbian', symbol: 'srp' }
const skills = [
  { id: 's1', name: 'Housing' },
  { id: 's2', name: 'Banking' },
]

function Probe() {
  const location = useLocation()
  return <output data-testid="path">{`${location.pathname}|${JSON.stringify(location.state)}`}</output>
}

const show = (ui: ReactNode, route = '/people/p1') =>
  renderApp(
    <>
      <Routes>
        <Route path="*" element={ui} />
      </Routes>
      <Probe />
    </>,
    { route },
  )

/** The reference data the people components load. */
function arrange() {
  capture('get', '/api/person/skills', list(skills))
  server.use(
    http.get(`${API}/api/common/languages`, ({ request }) => {
      const corridor = new URL(request.url).searchParams.get('country_ids')
      return HttpResponse.json(corridor ? [russian, german] : [russian, german, serbian])
    }),
  )
}

beforeEach(arrange)

describe('PersonRow', () => {
  it('shows the helper: where, how they help, vouches and rating — a check once the account is linked', () => {
    show(<PersonRow person={person({ id: 'p1', name: 'Igor Petrov', status: 'claimed', city: 'Berlin', skills: ['Housing', 'Taxes'], vouches: 3, ratingAvg: 4.5, reviewsCount: 2 })} compact={false} />)
    const row = screen.getByRole('link', { name: /Igor Petrov/ })
    expect(row).toHaveAttribute('href', '/people/p1')
    expect(within(row).getByText('Berlin · Housing, Taxes')).toBeInTheDocument()
    expect(within(row).getByText('3 vouches')).toBeInTheDocument()
    expect(within(row).getByText('4.5')).toBeInTheDocument()
    expect(within(row).getByRole('img', { name: 'Verified' })).toBeInTheDocument()
  })

  it('says reviews are off, hides the city that was not published and has no check before the claim', () => {
    show(<PersonRow person={person({ id: 'p2', name: 'Nino G.', status: 'confirmed', city: null, skills: [], allowReviews: false, vouches: 1 })} compact />)
    const row = screen.getByRole('link', { name: /Nino G\./ })
    expect(within(row).getByText('Reviews off')).toBeInTheDocument()
    expect(within(row).getByText('1 vouch')).toBeInTheDocument()
    expect(within(row).queryByRole('img', { name: 'Verified' })).not.toBeInTheDocument()
  })
})

describe('SpokenLanguagesField', () => {
  it('offers the corridor languages as chips, and the rest in a picker', async () => {
    const onChange = vi.fn()
    show(<SpokenLanguagesField label="Speaks" value={[]} onChange={onChange} countryIds={['de']} />)
    await userEvent.click(await screen.findByRole('button', { name: 'German' }))
    expect(onChange).toHaveBeenCalledWith(['l-de'])
    const picker = screen.getByRole('combobox', { name: 'Another language' })
    await within(picker).findByRole('option', { name: 'Serbian' })
    await userEvent.selectOptions(picker, 'l-sr')
    expect(onChange).toHaveBeenLastCalledWith(['l-sr'])
  })

  it('keeps a picked language that is not in the corridor as a chip and hides the picker at the limit', async () => {
    show(<SpokenLanguagesField label="Speaks" value={['l-sr']} onChange={vi.fn()} countryIds={['de']} max={1} />)
    expect(await screen.findByRole('button', { name: 'Serbian' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('shows nothing without a language list', async () => {
    server.use(http.get(`${API}/api/common/languages`, () => HttpResponse.json([])))
    show(<SpokenLanguagesField label="Speaks" value={[]} onChange={vi.fn()} countryIds={[]} />)
    await waitFor(() => expect(screen.queryByRole('button')).not.toBeInTheDocument())
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })
})

describe('PeopleFilters', () => {
  it('edits the city, the skills (from the backend) and the languages', async () => {
    const onChange = vi.fn()
    show(<PeopleFilters filters={{ city: '', skills: [], languageIds: [] }} onChange={onChange} countryIds={['de']} />)
    fireEvent.change(screen.getByRole('textbox', { name: 'City' }), { target: { value: 'Ham' } })
    expect(onChange).toHaveBeenLastCalledWith({ city: 'Ham', skills: [], languageIds: [] })
    await userEvent.click(await screen.findByRole('button', { name: 'Banking' }))
    expect(onChange).toHaveBeenLastCalledWith({ city: '', skills: ['Banking'], languageIds: [] })
    await userEvent.click(await screen.findByRole('button', { name: 'Russian' }))
    expect(onChange).toHaveBeenLastCalledWith({ city: '', skills: [], languageIds: ['l-ru'] })
  })

  it('has no skills block while the backend has none', async () => {
    capture('get', '/api/person/skills', list([]))
    show(<PeopleFilters filters={{ city: '', skills: [], languageIds: [] }} onChange={vi.fn()} countryIds={[]} />)
    expect(await screen.findByRole('textbox', { name: 'City' })).toBeInTheDocument()
    expect(screen.queryByText('Skills')).not.toBeInTheDocument()
  })
})

describe('PersonContacts', () => {
  it('shows only the contacts the person published, and says what is private', () => {
    const { unmount } = show(<PersonContacts person={person({ name: 'Igor Petrov', whatsapp: '+49 176 1234 5678' })} />)
    expect(screen.getByRole('link', { name: /WhatsApp · \+49 176 1234 5678/ })).toHaveAttribute('href', 'https://wa.me/4917612345678')
    expect(screen.getByText('Igor keeps Telegram, Instagram, email private')).toBeInTheDocument()
    unmount()

    const all = show(<PersonContacts person={person({ name: 'Igor Petrov', email: 'igor@example.org', whatsapp: '+49 1', telegram: '@igor_tg', instagram: 'igor.ig' })} />)
    expect(screen.getByRole('link', { name: 'igor@example.org' })).toHaveAttribute('href', 'mailto:igor@example.org')
    expect(screen.getByRole('link', { name: 'Telegram · @igor_tg' })).toHaveAttribute('href', 'https://t.me/igor_tg')
    expect(screen.getByRole('link', { name: 'Instagram · igor.ig' })).toHaveAttribute('href', 'https://instagram.com/igor.ig')
    expect(screen.getByText('These are the contacts Igor chose to show')).toBeInTheDocument()
    all.unmount()

    const emailOnly = show(<PersonContacts person={person({ name: 'Igor Petrov', email: 'igor@example.org' })} />)
    expect(screen.getByText('Igor keeps WhatsApp, Telegram, Instagram private')).toBeInTheDocument()
    emailOnly.unmount()

    const socialOnly = show(<PersonContacts person={person({ name: 'Igor Petrov', telegram: 'igor_tg' })} />)
    expect(screen.getByText('Igor keeps WhatsApp, Instagram, email private')).toBeInTheDocument()
    socialOnly.unmount()

    show(<PersonContacts person={person({ name: 'Igor Petrov' })} />)
    expect(screen.getByText('Igor keeps contacts private')).toBeInTheDocument()
  })

  it('sends a guest who vouches or saves to sign in, and back to this profile', async () => {
    show(<PersonContacts person={person({ id: 'p1', name: 'Igor Petrov', vouches: 2 })} />)
    await userEvent.click(screen.getByRole('button', { name: 'Vouch for Igor · 2' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/signin|{"from":{"pathname":"/people/p1","search":""}}')
  })

  describe('signed in', () => {
    beforeEach(() => useAuthStore.getState().setAuth(authUser()))

    it('vouches once and shows it', async () => {
      const vouches = capture('post', '/api/person/vouch/p1', person({ id: 'p1', vouches: 3, vouchedByMe: true }))
      capture('get', '/api/saved/list', list([]))
      show(<PersonContacts person={person({ id: 'p1', name: 'Igor Petrov', vouches: 2 })} />)
      await userEvent.click(screen.getByRole('button', { name: 'Vouch for Igor · 2' }))
      await waitFor(() => expect(vouches).toHaveLength(1))
      expect(vouches[0].body).toEqual({})
    })

    it('shows an earlier vouch as done', () => {
      capture('get', '/api/saved/list', list([]))
      show(<PersonContacts person={person({ id: 'p1', vouches: 4, vouchedByMe: true })} />)
      expect(screen.getByRole('button', { name: 'You vouched · 4' })).toBeDisabled()
    })

    it.each([
      [403, "You can't vouch for someone you recommended."],
      [422, "Couldn't record your vouch. Try again."],
    ])('explains a refused vouch (%i)', async (status, message) => {
      capture('post', '/api/person/vouch/p1', { error: 'no' }, status)
      capture('get', '/api/saved/list', list([]))
      show(<PersonContacts person={person({ id: 'p1', name: 'Igor Petrov' })} />)
      await userEvent.click(screen.getByRole('button', { name: /Vouch for Igor/ }))
      expect(await screen.findByText(message)).toBeInTheDocument()
    })

    it('saves and unsaves the helper', async () => {
      capture('get', '/api/saved/list', list([savedItem({ id: 'sv1', kind: 'person', targetId: 'p1' })]))
      const removed = capture('delete', '/api/saved/delete/sv1', null)
      show(<PersonContacts person={person({ id: 'p1' })} />)
      const saved = await screen.findByRole('button', { name: 'Saved' })
      expect(saved).toHaveAttribute('aria-pressed', 'true')
      await userEvent.click(saved)
      await waitFor(() => expect(removed).toHaveLength(1))
    })

    it('saves a helper that is not saved yet', async () => {
      capture('get', '/api/saved/list', list([]))
      const created = capture('post', '/api/saved/create', savedItem())
      show(<PersonContacts person={person({ id: 'p9' })} />)
      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
      await waitFor(() => expect(created).toHaveLength(1))
      expect(created[0].body).toEqual({ kind: 'person', target_id: 'p9' })
    })
  })
})

describe('ClaimLinkSheet', () => {
  const created = (over: Partial<PersonCreated> = {}): PersonCreated => ({ person: person({ name: 'Daria Kuznetsova', status: 'pending' }), claimUrl: '/claim/tok123', sendVia: 'whatsapp', ...over })

  afterEach(() => vi.useRealTimers())

  it('is closed until a recommendation was created', () => {
    show(<ClaimLinkSheet created={undefined} contacts={{ whatsapp: '', email: '', telegram: '', instagram: '' }} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the personal link, opens WhatsApp with the message ready and copies the link', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    show(<ClaimLinkSheet created={created()} contacts={{ whatsapp: '+49 157 4410 2290', email: '', telegram: '', instagram: '' }} onClose={vi.fn()} />)
    const link = `${window.location.origin}/claim/tok123`
    expect(screen.getByText(link)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Send Daria their link' })).toBeInTheDocument()
    const whatsapp = screen.getByRole('link', { name: 'Open WhatsApp' })
    expect(whatsapp.getAttribute('href')).toContain('https://wa.me/4915744102290?text=')
    expect(decodeURIComponent(whatsapp.getAttribute('href')!)).toContain(link)
    expect(screen.getByText('Moderators review the recommendation')).toBeInTheDocument()

    vi.useFakeTimers({ shouldAdvanceTime: true })
    await userEvent.click(screen.getByRole('button', { name: 'Copy' }))
    expect(writeText).toHaveBeenCalledWith(link)
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
    await act(() => vi.advanceTimersByTimeAsync(COPIED_FEEDBACK_MS))
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
  })

  it('opens an email when that is how the link goes, and survives a refused clipboard', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
    show(<ClaimLinkSheet created={created({ sendVia: 'email' })} contacts={{ whatsapp: '', email: ' daria@example.org ', telegram: '', instagram: '' }} onClose={vi.fn()} />)
    const mail = screen.getByRole('link', { name: 'Open email' })
    expect(mail.getAttribute('href')).toMatch(/^mailto:daria@example\.org\?subject=/)
    await userEvent.click(screen.getByRole('button', { name: 'Copy' }))
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
  })

  it.each([
    ['telegram', { telegram: ' @daria_tg ' }, 'Open Telegram', 'https://t.me/daria_tg'],
    ['instagram', { instagram: 'daria.k' }, 'Open Instagram', 'https://instagram.com/daria.k'],
  ] as const)('opens the person\'s %s chat or profile and says to paste the link', (via, contacts, label, href) => {
    show(<ClaimLinkSheet created={created({ sendVia: via })} contacts={{ whatsapp: '', email: '', telegram: '', instagram: '', ...contacts }} onClose={vi.fn()} />)
    expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href)
    expect(screen.getByText(/can’t take the text along/)).toBeInTheDocument()
  })

  it('closes with its button', async () => {
    const onClose = vi.fn()
    show(<ClaimLinkSheet created={created()} contacts={{ whatsapp: '+49 1', email: '', telegram: '', instagram: '' }} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })
})

describe('RecommendForm', () => {
  const de = country({ id: 'de-id', name: 'Germany' })
  const render = (onDone = vi.fn()) => ({ onDone, ...show(<RecommendForm countryId={de.id} countryIds={['de-id']} onDone={onDone} />, '/people/recommend') })
  const submit = () => userEvent.click(screen.getByRole('button', { name: 'Create claim link' }))
  const fillBasics = async () => {
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), '  Daria Kuznetsova ')
    await userEvent.type(screen.getByRole('textbox', { name: /How can they be reached/ }), '+49 157 4410 2290')
    await userEvent.click(screen.getByRole('checkbox', { name: /agreed to be recommended/ }))
  }

  it('asks for the name, a contact and the consent before sending anything', async () => {
    const created = capture('post', '/api/person/create', {})
    render()
    await submit()
    expect(await screen.findByText('Enter their name')).toBeInTheDocument()
    expect(screen.getByText('Add at least one contact: WhatsApp, email, Telegram or Instagram')).toBeInTheDocument()
    expect(screen.getByText('Confirm that they agreed')).toBeInTheDocument()
    expect(created).toHaveLength(0)
  })

  it('wants the contact the link goes through, and a valid email', async () => {
    capture('post', '/api/person/create', {})
    render()
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'Daria')
    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'not-an-email')
    await userEvent.click(screen.getByRole('radio', { name: 'WhatsApp' }))
    await submit()
    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument()
    expect(screen.getByText('Add the contact you chose to send the link through')).toBeInTheDocument()
  })

  it('creates the recommendation with the backend’s skills and languages and hands over the claim link', async () => {
    const created = capture('post', '/api/person/create', { person: person({ name: 'Daria Kuznetsova', status: 'pending' }), claimUrl: '/claim/tok123', sendVia: 'whatsapp' })
    const { onDone } = render()
    await userEvent.type(screen.getByRole('textbox', { name: /^City/ }), 'Berlin')
    await userEvent.type(screen.getByRole('textbox', { name: /How they help/ }), 'Helps with flats')
    await userEvent.click(await screen.findByRole('button', { name: 'Housing' }))
    await userEvent.click(await screen.findByRole('button', { name: 'German' }))
    await fillBasics()
    await submit()

    await waitFor(() => expect(created).toHaveLength(1))
    expect(created[0].body).toEqual({
      name: 'Daria Kuznetsova',
      consent_given: true,
      city: 'Berlin',
      bio: 'Helps with flats',
      skills: ['Housing'],
      language_ids: ['l-de'],
      location_country_id: 'de-id',
      whatsapp: '+49 157 4410 2290',
      send_via: 'whatsapp',
    })
    expect(await screen.findByRole('heading', { name: 'Send Daria their link' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onDone).toHaveBeenCalled()
  })

  it('sends the link by email when that is chosen', async () => {
    const created = capture('post', '/api/person/create', { person: person({ name: 'Daria', status: 'pending' }), claimUrl: '/claim/t', sendVia: 'email' })
    render()
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'Daria')
    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'daria@example.org')
    await userEvent.click(screen.getByRole('radio', { name: 'Email' }))
    await userEvent.click(screen.getByRole('checkbox', { name: /agreed/ }))
    await submit()
    await waitFor(() => expect(created).toHaveLength(1))
    expect(created[0].body).toMatchObject({ email: 'daria@example.org', send_via: 'email' })
    expect(await screen.findByRole('link', { name: 'Open email' })).toBeInTheDocument()
  })

  it('recommends someone reachable only on Telegram or Instagram, and sends the link that way', async () => {
    const created = capture('post', '/api/person/create', { person: person({ name: 'Daria', status: 'pending' }), claimUrl: '/claim/t', sendVia: 'telegram' })
    render()
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'Daria')
    await userEvent.type(screen.getByRole('textbox', { name: 'Telegram' }), '@daria_tg')
    await userEvent.type(screen.getByRole('textbox', { name: 'Instagram' }), 'daria.k')
    await userEvent.click(screen.getByRole('radio', { name: 'Telegram' }))
    await userEvent.click(screen.getByRole('checkbox', { name: /agreed/ }))
    await submit()
    await waitFor(() => expect(created).toHaveLength(1))
    expect(created[0].body).toMatchObject({ telegram: '@daria_tg', instagram: 'daria.k', send_via: 'telegram' })
    expect(created[0].body).not.toHaveProperty('whatsapp')
    expect(await screen.findByRole('link', { name: 'Open Telegram' })).toHaveAttribute('href', 'https://t.me/daria_tg')
  })

  it('has no skills block while the backend has none', async () => {
    capture('get', '/api/person/skills', list([]))
    render()
    expect(await screen.findByRole('textbox', { name: 'Name' })).toBeInTheDocument()
    expect(screen.queryByText('Skills')).not.toBeInTheDocument()
  })

  it.each([
    [429, 'You have recommended a lot of people recently. Try again later.', { error: 'Too many' }],
    [422, 'name: too long', { error: 'name: too long' }],
    [500, "Couldn't create the recommendation. Try again.", {}],
  ])('explains why it failed (%i)', async (status, message, body) => {
    capture('post', '/api/person/create', body, status)
    render()
    await fillBasics()
    await submit()
    expect(await screen.findByText(message)).toBeInTheDocument()
  })
})
