import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { delay, http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import i18n from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import { authUser, corridor, country, list, organisation, person, userProfile } from '@/test/factories'
import { renderApp } from '@/test/render'
import { API, capture, server } from '@/test/server'
import { setViewportWidth } from '@/test/viewport'
import { BIO_MAX_CHARS, MINE_DEFAULT_LIMIT, type MyOrganisation, type MyPerson } from '@/types/api'
import AccountPage from '../AccountPage'
import EditProfilePage from '../EditProfilePage'

const ME = 'user-me'
const russia = country({ name: 'Russia', flag: '🇷🇺' })
const germany = country({ name: 'Germany', flag: '🇩🇪' })
const languages = [
  { id: 'lang-en', name: 'English', symbol: 'eng' },
  { id: 'lang-de', name: 'German', symbol: 'deu' },
  { id: 'lang-ru', name: 'Russian', symbol: 'rus' },
]
const business = { id: 'type-business', type: 'business', slug: 'business', title: 'Business', color: null }
const custom = { id: 'type-custom', type: 'club', slug: 'club', title: null, color: '#123456' }
const ago = (ms: number) => new Date(Date.now() - ms).toISOString()
const HOUR = 3_600_000
const myPlace = (over: Partial<MyOrganisation>): MyOrganisation => ({ ...organisation(), moderationNote: null, ...over })
const myPerson = (over: Partial<MyPerson>): MyPerson => ({ ...person(), moderationNote: null, updatedAt: ago(2 * HOUR), rejectedByModerator: false, ...over })

function Probe() {
  return <output data-testid="path">{useLocation().pathname}</output>
}

const open = (route: string) =>
  renderApp(
    <>
      <Routes>
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/edit" element={<EditProfilePage />} />
        <Route path="/" element={<p>Landing</p>} />
      </Routes>
      <Probe />
    </>,
    { route },
  )

const profile = userProfile({
  id: ME,
  username: 'daria',
  name: 'Daria K.',
  city: 'Berlin',
  bio: 'Moved in 2022.',
  hereAs: 'helping',
  homeCountryId: russia.id,
  avatarColor: '#C7613F',
  stats: { placesAdded: 1, peopleHelped: 0, peopleRecommended: 2, reviews: 3, saved: 4, rating: null },
})

beforeEach(async () => {
  await i18n.changeLanguage('en')
  useAuthStore.getState().setAuth(authUser({ id: ME }))
  capture('get', '/api/user/me', profile)
  capture('get', `/api/user/${ME}/languages`, { userId: ME, languageIds: ['lang-en', 'lang-ru'] })
  capture('get', '/api/common/countries', [russia, germany])
  capture('get', '/api/common/org_types', [business, custom])
  capture('get', '/api/common/languages', languages)
  capture('get', '/api/organisation/mine', list([]))
  capture('get', '/api/person/mine', list([]))
  capture('get', '/api/corridor/list', list([]))
})

describe('AccountPage', () => {
  it('shows who the account is, the counters and the languages', async () => {
    open('/account')
    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Daria K.' })).toBeInTheDocument()
    expect(await screen.findByText('@daria · Berlin · from 🇷🇺 Russia')).toBeInTheDocument()
    expect(screen.getByText('Helping others')).toBeInTheDocument()
    expect(screen.getByText('Moved in 2022.')).toBeInTheDocument()
    for (const [value, label] of [['1', 'place added'], ['2', 'people recommended'], ['3', 'reviews'], ['4', 'saved']]) {
      expect(screen.getByText(label).parentElement).toHaveTextContent(value)
    }
    // "English" is also an option of the interface-language select in the top bar.
    await waitFor(() => expect(screen.getAllByText('English').some((element) => element.tagName !== 'OPTION')).toBe(true))
    expect(screen.getByText('Russian')).toBeInTheDocument()
    expect(screen.queryByText('German')).not.toBeInTheDocument()
    // One main landmark; the name is the page's h1 and every block below it an h2 (Lighthouse heading-order).
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { level: 1, name: 'Daria K.' }))
    for (const block of ['Languages I speak', 'My places', 'People I recommended', 'My corridors']) {
      expect(screen.getByRole('heading', { level: 2, name: block })).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: 'Edit profile' })).toHaveAttribute('href', '/account/edit')
    expect(screen.getByRole('link', { name: 'Add a place' })).toHaveAttribute('href', '/add')
    expect(screen.getByRole('link', { name: 'Recommend' })).toHaveAttribute('href', '/people')
  })

  it('falls back to the username and says what is empty', async () => {
    capture('get', '/api/user/me', userProfile({ id: ME, username: 'daria', name: '' }))
    capture('get', `/api/user/${ME}/languages`, { userId: ME, languageIds: [] })
    open('/account')
    expect(await screen.findByRole('heading', { name: 'daria' })).toBeInTheDocument()
    expect(screen.getByText('@daria')).toBeInTheDocument()
    expect(await screen.findByText('No languages added yet.')).toBeInTheDocument()
    expect(await screen.findByText("You haven't added a place yet")).toBeInTheDocument()
    expect(await screen.findByText("You haven't recommended anyone yet")).toBeInTheDocument()
    expect(await screen.findByText('No corridors yet')).toBeInTheDocument()
  })

  it('lists the own places in every status with the moderator note', async () => {
    capture(
      'get',
      '/api/organisation/mine',
      list([
        myPlace({ name: 'Samovar Deli', status: 'live', organisationTypeId: business.id, updatedAt: '2020-03-02T10:00:00' }),
        myPlace({ name: 'Praxis', status: 'pending', organisationTypeId: custom.id, updatedAt: ago(2 * HOUR), moderationNote: 'Add a phone number.' }),
        myPlace({ name: 'June Cafe', status: 'pending', updatedAt: ago(3 * HOUR) }),
        myPlace({ name: 'Library', status: 'rejected', updatedAt: ago(5 * HOUR), moderationNote: 'Duplicate.' }),
      ]),
    )
    open('/account')
    const places = within(await screen.findByRole('list', { name: 'My places' }))
    expect(places.getByText('Business · Live since Mar 2, 2020')).toBeInTheDocument()
    expect(places.getByText('club · Changes requested · 2 hours ago')).toBeInTheDocument()
    expect(places.getByText('Add a phone number.')).toBeInTheDocument()
    expect(places.getByText('Submitted 3 hours ago')).toBeInTheDocument()
    expect(places.getByText('Rejected · 5 hours ago')).toBeInTheDocument()
    // Each place leads to its edit form.
    expect(places.getAllByRole('link', { name: 'Edit' })).toHaveLength(4)
    expect(places.getByText('Duplicate.')).toBeInTheDocument()
    expect(places.getAllByText('Moderator:')).toHaveLength(2)
  })

  it('lists the recommended people with where each one stands', async () => {
    capture(
      'get',
      '/api/person/mine',
      list([
        myPerson({ name: 'Irina', status: 'pending', moderationNote: 'The bio is too short.' }),
        myPerson({ name: 'Oleg', status: 'pending' }),
        myPerson({ name: 'Anna', status: 'awaiting' }),
        myPerson({ name: 'Dmitri', status: 'claimed' }),
        myPerson({ name: 'Elena', status: 'confirmed' }),
        myPerson({ name: 'Pavel', status: 'declined' }),
        myPerson({ name: 'Viktor', status: 'declined', rejectedByModerator: true }),
      ]),
    )
    open('/account')
    const people = within(await screen.findByRole('list', { name: 'People I recommended' }))
    expect(people.getByText('Changes requested · 2 hours ago')).toBeInTheDocument()
    expect(people.getByText('The bio is too short.')).toBeInTheDocument()
    expect(people.getByText('Sent for review 2 hours ago')).toBeInTheDocument()
    expect(people.getByText('Claim link created 2 hours ago')).toBeInTheDocument()
    expect(people.getByText('Linked their Landly account')).toBeInTheDocument()
    expect(people.getByText('Confirmed 2 hours ago')).toBeInTheDocument()
    expect(people.getByText('Declined 2 hours ago')).toBeInTheDocument()
    // A moderator's reject is not the person turning the claim down.
    const viktor = people.getAllByRole('listitem').find((item) => item.textContent?.includes('Viktor'))!
    expect(within(viktor).getByText('Rejected by a moderator · 2 hours ago')).toBeInTheDocument()
    expect(within(viktor).getByText('Rejected')).toBeInTheDocument()
  })

  it('loads more of the own places and people with "Show more" until the last page', async () => {
    const places = Array.from({ length: MINE_DEFAULT_LIMIT + 1 }, (_, i) => myPlace({ name: `Place ${i + 1}`, status: 'live' }))
    const people = Array.from({ length: MINE_DEFAULT_LIMIT + 1 }, (_, i) => myPerson({ name: `Person ${i + 1}`, status: 'awaiting' }))
    for (const [path, all] of [['/api/organisation/mine', places], ['/api/person/mine', people]] as [string, unknown[]][]) {
      server.use(
        http.get(`${API}${path}`, ({ request }) => {
          const query = new URL(request.url).searchParams
          const offset = Number(query.get('offset'))
          return HttpResponse.json(list(all.slice(offset, offset + Number(query.get('limit')))))
        }),
      )
    }
    open('/account')
    for (const [name, last] of [['My places', `Place ${MINE_DEFAULT_LIMIT + 1}`], ['People I recommended', `Person ${MINE_DEFAULT_LIMIT + 1}`]]) {
      const block = await screen.findByRole('list', { name })
      expect(within(block).getAllByRole('listitem')).toHaveLength(MINE_DEFAULT_LIMIT)
      const section = block.closest('section')!
      await userEvent.click(within(section).getByRole('button', { name: 'Show more' }))
      expect(await within(block).findByText(last)).toBeInTheDocument()
      // A short page is the last one.
      await waitFor(() => expect(within(section).queryByRole('button', { name: 'Show more' })).not.toBeInTheDocument())
    }
  })

  it('lists the corridors and opens the corridor picker from "Manage"', async () => {
    const saved = corridor({ fromCountryId: russia.id, toCountryId: germany.id, isDefault: true })
    const other = corridor({ fromCountryId: russia.id, toCountryId: russia.id })
    capture('get', '/api/corridor/list', list([saved, other]))
    capture('get', `/api/corridor/stats/${other.id}`, { corridorId: other.id, fromCountryId: russia.id, toCountryId: russia.id, totalPlaces: 0, newThisWeek: 0, byType: [] })
    capture('get', `/api/corridor/stats/${saved.id}`, { corridorId: saved.id, fromCountryId: russia.id, toCountryId: germany.id, totalPlaces: 74, newThisWeek: 0, byType: [{ slug: 'business', count: 74 }] })
    open('/account')
    const corridors = within(await screen.findByRole('list', { name: 'My corridors' }))
    expect(await corridors.findByText('Russia → Germany')).toBeInTheDocument()
    expect(await corridors.findByText(/74 live places/)).toBeInTheDocument()
    // The short list: no split by type, no button to pick the corridor.
    expect(corridors.queryByText('Business')).not.toBeInTheDocument()
    expect(corridors.queryByRole('button')).not.toBeInTheDocument()
    expect(corridors.getAllByText('Default')).toHaveLength(1)
    await userEvent.click(screen.getByRole('button', { name: 'Manage' }))
    expect(await screen.findByRole('dialog', { name: 'Your corridors' })).toBeInTheDocument()
  })

  it('shows each list as loading until it arrives', async () => {
    for (const path of ['/api/organisation/mine', '/api/person/mine', '/api/corridor/list']) server.use(http.get(`${API}${path}`, () => delay('infinite')))
    open('/account')
    expect(await screen.findByRole('heading', { name: 'Daria K.' })).toBeInTheDocument()
    expect(screen.getAllByText('Loading…')).toHaveLength(3)
  })

  it('says which list could not be loaded', async () => {
    capture('get', '/api/organisation/mine', { error: 'boom' }, 500)
    capture('get', '/api/person/mine', { error: 'boom' }, 500)
    capture('get', '/api/corridor/list', { error: 'boom' }, 500)
    open('/account')
    expect(await screen.findByText("Couldn't load your places")).toBeInTheDocument()
    expect(await screen.findByText("Couldn't load your recommendations")).toBeInTheDocument()
    expect(await screen.findAllByText("Couldn't load your corridors")).not.toHaveLength(0)
  })

  it('offers to retry when the profile cannot be loaded', async () => {
    capture('get', '/api/user/me', { error: 'boom' }, 500)
    open('/account')
    expect(await screen.findByText("Couldn't load your account")).toBeInTheDocument()
    capture('get', '/api/user/me', profile)
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { name: 'Daria K.' })).toBeInTheDocument()
  })

  it('signs out to the landing page', async () => {
    open('/account')
    await userEvent.click(await screen.findByRole('button', { name: 'Sign out' }))
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(screen.getByTestId('path')).toHaveTextContent('/')
  })

  it('has its own header on a phone', async () => {
    setViewportWidth(375)
    open('/account')
    expect(await screen.findByRole('heading', { name: 'Daria K.' })).toBeInTheDocument()
    expect(screen.getAllByRole('banner').some((header) => header.textContent === 'Account')).toBe(true)
  })
})

describe('EditProfilePage', () => {
  const pick = (name: string, value: string) => userEvent.selectOptions(screen.getByRole('combobox', { name }), value)

  it('saves the profile and the changed languages, then goes back to the account', async () => {
    const saved = capture('put', '/api/user/me', { ...profile, name: 'Dasha', locale: 'ru' })
    const added = capture('post', '/api/user/languages', { userId: ME, languageIds: ['lang-en', 'lang-de'] })
    const removed = capture('delete', '/api/user/languages', null)
    open('/account/edit')
    const name = await screen.findByRole('textbox', { name: 'Name' })
    expect(name).toHaveValue('Daria K.')
    expect(screen.getByText('daria@example.com')).toBeInTheDocument()
    expect(screen.getByText('@daria')).toBeInTheDocument()

    await userEvent.clear(name)
    await userEvent.type(name, ' Dasha ')
    await userEvent.clear(screen.getByRole('textbox', { name: 'City' }))
    await userEvent.type(screen.getByRole('textbox', { name: /About me/ }), ' Happy to help.')
    await pick('Home country', germany.id)
    await userEvent.click(screen.getByRole('radio', { name: 'Русский' }))
    await userEvent.click(screen.getByRole('button', { name: 'Just exploring' }))
    await userEvent.click(screen.getByRole('radio', { name: 'Green' }))
    await pick('Add a language', 'lang-de')
    await userEvent.click(screen.getByRole('button', { name: 'Remove Russian' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/account'))
    expect(saved[0].body).toEqual({ name: 'Dasha', city: '', bio: 'Moved in 2022. Happy to help.', locale: 'ru', home_country_id: germany.id, here_as: 'exploring', avatar_color: '#4F7F5C' })
    expect(added[0].body).toEqual({ languages_ids: ['lang-de'] })
    expect(removed[0].body).toEqual({ language_id: 'lang-ru' })
    expect(i18n.resolvedLanguage).toBe('ru')
  })

  it('sends only what the profile has when nothing was chosen', async () => {
    capture('get', '/api/user/me', userProfile({ id: ME }))
    capture('get', `/api/user/${ME}/languages`, { userId: ME, languageIds: [] })
    const saved = capture('put', '/api/user/me', userProfile({ id: ME }))
    const added = capture('post', '/api/user/languages', null)
    open('/account/edit')
    await userEvent.click(await screen.findByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(saved).toHaveLength(1))
    expect(saved[0].body).toEqual({ name: '', city: '', bio: '', locale: 'en' })
    expect(added).toHaveLength(0)
  })

  it('starts from the language the interface is in, not the one stored in the profile', async () => {
    // The stored profile says English; the user switched the interface to Russian in the top bar.
    await i18n.changeLanguage('ru')
    const saved = capture('put', '/api/user/me', { ...profile, locale: 'ru' })
    open('/account/edit')
    expect(await screen.findByRole('radio', { name: 'Русский' })).toBeChecked()
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить изменения' }))
    await waitFor(() => expect(saved).toHaveLength(1))
    expect(saved[0].body).toMatchObject({ locale: 'ru' })
    expect(i18n.resolvedLanguage).toBe('ru')
  })

  it('keeps the form and says so when the save is refused', async () => {
    capture('put', '/api/user/me', { error: 'boom' }, 500)
    open('/account/edit')
    await userEvent.click(await screen.findByRole('button', { name: 'Save changes' }))
    expect(await screen.findByText("Couldn't save your profile. Try again.")).toBeInTheDocument()
    expect(screen.getByTestId('path')).toHaveTextContent('/account/edit')
  })

  it('refuses a text longer than the server takes', async () => {
    const saved = capture('put', '/api/user/me', profile)
    open('/account/edit')
    fireEvent.change(await screen.findByRole('textbox', { name: /About me/ }), { target: { value: 'x'.repeat(BIO_MAX_CHARS + 1) } })
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByText('This is too long')).toBeInTheDocument()
    expect(saved).toHaveLength(0)
  })

  it('goes back without saving on "Cancel"', async () => {
    const saved = capture('put', '/api/user/me', profile)
    open('/account/edit')
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/account')
    expect(saved).toHaveLength(0)
  })

  it('saves from the header on a phone, where the bottom buttons are gone', async () => {
    setViewportWidth(375)
    const saved = capture('put', '/api/user/me', profile)
    open('/account/edit')
    await screen.findByRole('textbox', { name: 'Name' })
    expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(saved).toHaveLength(1))
  })

  it('goes back from the phone header', async () => {
    setViewportWidth(375)
    open('/account/edit')
    await screen.findByRole('textbox', { name: 'Name' })
    await userEvent.click(within(screen.getByRole('textbox', { name: 'Name' }).closest('form')!.parentElement!.parentElement!.previousElementSibling as HTMLElement).getAllByRole('button')[0])
    expect(screen.getByTestId('path')).toHaveTextContent('/account')
  })

  it('offers to retry when the profile or its languages cannot be loaded', async () => {
    capture('get', `/api/user/${ME}/languages`, { error: 'boom' }, 500)
    open('/account/edit')
    expect(await screen.findByText("Couldn't load your account")).toBeInTheDocument()
    capture('get', `/api/user/${ME}/languages`, { userId: ME, languageIds: [] })
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('textbox', { name: 'Name' })).toBeInTheDocument()
  })
})
