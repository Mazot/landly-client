import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { useCorridorStore } from '@/stores/corridorStore'
import { authUser, corridor, country, list, userProfile } from '@/test/factories'
import { renderApp } from '@/test/render'
import { API, capture, server } from '@/test/server'
import { CorridorsSheet } from '../CorridorsSheet'

// The stored pair outlives a test (it is a module-level store): start without one.
beforeEach(() => useCorridorStore.setState({ fromId: null, toId: null }))

const russia = country({ name: 'Russia', flag: '🇷🇺' })
const germany = country({ name: 'Germany', flag: '🇩🇪' })
const serbia = country({ name: 'Serbia', flag: '🇷🇸' })
const poland = country({ name: 'Poland', flag: '🇵🇱' })
const home = corridor({ fromCountryId: russia.id, toCountryId: germany.id, isDefault: true })
const toSerbia = corridor({ fromCountryId: russia.id, toCountryId: serbia.id })

const stats = (c: ReturnType<typeof corridor>) => ({ corridorId: c.id, fromCountryId: c.fromCountryId, toCountryId: c.toCountryId, totalPlaces: 10, newThisWeek: 1, byType: [] })

/** Signed in with the given saved corridors (the default one is shown first, like the server does). */
function arrangeSignedIn(saved = [home, toSerbia]) {
  useAuthStore.getState().setAuth(authUser())
  capture('get', '/api/common/countries', [russia, germany, serbia, poland])
  capture('get', '/api/common/org_types', [])
  capture('get', '/api/user/me', userProfile())
  capture('get', '/api/corridor/list', list(saved))
  for (const c of saved) capture('get', `/api/corridor/stats/${c.id}`, stats(c))
}
const open = () => {
  const onClose = vi.fn()
  renderApp(<CorridorsSheet onClose={onClose} />)
  return onClose
}
const sheet = () => screen.getByRole('dialog')

describe('CorridorsSheet · guest', () => {
  it('lets a guest choose the pair, and shows the map for it', async () => {
    capture('get', '/api/common/countries', [russia, germany, serbia])
    const onClose = open()
    expect(screen.getByRole('dialog', { name: 'Choose your corridor' })).toBeInTheDocument()
    expect(screen.getByText('The map shows the places of the country you live in')).toBeInTheDocument()

    await waitFor(() => expect(screen.getByLabelText("I'm from")).toHaveValue(russia.id))
    expect(screen.getByLabelText('Living in')).toHaveValue(germany.id)
    await userEvent.selectOptions(screen.getByLabelText('Living in'), serbia.id)
    await userEvent.click(screen.getByRole('button', { name: 'Show the map' }))

    expect(onClose).toHaveBeenCalledOnce()
    expect(useCorridorStore.getState()).toMatchObject({ fromId: russia.id, toId: serbia.id })
  })

  it('has nothing to show before the countries are known', () => {
    capture('get', '/api/common/countries', [])
    open()
    expect(screen.getByRole('button', { name: 'Show the map' })).toBeDisabled()
  })
})

describe('CorridorsSheet · signed in', () => {
  it('lists the saved corridors with the default marked, and starts on the one the map shows', async () => {
    arrangeSignedIn()
    open()
    expect(screen.getByRole('dialog', { name: 'Your corridors' })).toBeInTheDocument()
    expect(screen.getByText('The map opens to your default corridor')).toBeInTheDocument()
    const rows = await within(sheet()).findAllByRole('button', { name: /^Russia →/ })
    expect(rows.map((r) => r.getAttribute('aria-pressed'))).toEqual(['true', 'false'])
    expect(screen.getByText('Default')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Make Russia → Serbia the default corridor' })).toBeInTheDocument()
    // The corridor the map shows is already picked: nothing to switch to.
    expect(screen.getByRole('button', { name: 'Switch to Russia → Germany' })).toBeDisabled()
  })

  it('switches the map to the corridor picked in the list', async () => {
    arrangeSignedIn()
    const onClose = open()
    await userEvent.click(await screen.findByRole('button', { name: /^Russia → Serbia/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Switch to Russia → Serbia' }))
    expect(onClose).toHaveBeenCalledOnce()
    expect(useCorridorStore.getState()).toMatchObject({ fromId: russia.id, toId: serbia.id })
  })

  it('makes a corridor the default', async () => {
    arrangeSignedIn()
    const requests = capture('put', `/api/corridor/set-default/${toSerbia.id}`, { ...toSerbia, isDefault: true })
    open()
    await userEvent.click(await screen.findByRole('button', { name: 'Make Russia → Serbia the default corridor' }))
    await waitFor(() => expect(requests).toHaveLength(1))
  })

  it('adds a corridor, then picks it', async () => {
    arrangeSignedIn()
    const created = corridor({ fromCountryId: russia.id, toCountryId: poland.id })
    capture('get', `/api/corridor/stats/${created.id}`, stats(created))
    const requests = capture('post', '/api/corridor/create', created)
    open()
    const add = await screen.findByRole('button', { name: 'Add corridor' })
    await waitFor(() => expect(screen.getByLabelText('Destination')).toBeEnabled())
    // From starts at the corridor in use; with no destination there is nothing to add.
    await waitFor(() => expect(screen.getByLabelText("I'm from")).toHaveValue(russia.id))
    expect(add).toBeDisabled()
    await userEvent.selectOptions(screen.getByLabelText('Destination'), russia.id)
    expect(add).toBeDisabled()
    await userEvent.selectOptions(screen.getByLabelText('Destination'), poland.id)
    expect(add).toBeEnabled()
    await userEvent.click(add)
    await waitFor(() => expect(requests).toHaveLength(1))
    expect(requests[0].body).toEqual({ from_country_id: russia.id, to_country_id: poland.id })
    // The new corridor is picked (the list is refreshed from the server) and the destination is cleared.
    await waitFor(() => expect(screen.getByLabelText('Destination')).toHaveValue(''))
    server.use(http.get(`${API}/api/corridor/list`, () => HttpResponse.json(list([home, toSerbia, created]))))
  })

  it('says the corridor already exists', async () => {
    arrangeSignedIn()
    capture('post', '/api/corridor/create', { error: 'Conflict', constraint: 'corridors_unique_per_user' }, 422)
    open()
    await screen.findByRole('button', { name: 'Add corridor' })
    await waitFor(() => expect(screen.getByLabelText('Destination')).toBeEnabled())
    await userEvent.selectOptions(screen.getByLabelText('Destination'), serbia.id)
    await userEvent.click(screen.getByRole('button', { name: 'Add corridor' }))
    expect(await screen.findByText('You already have this corridor.')).toBeInTheDocument()
  })

  it('says it could not add the corridor, for any other failure', async () => {
    arrangeSignedIn()
    capture('post', '/api/corridor/create', 'boom', 500)
    open()
    await screen.findByRole('button', { name: 'Add corridor' })
    await waitFor(() => expect(screen.getByLabelText('Destination')).toBeEnabled())
    await userEvent.selectOptions(screen.getByLabelText('Destination'), poland.id)
    await userEvent.click(screen.getByRole('button', { name: 'Add corridor' }))
    expect(await screen.findByText('The corridor could not be added. Try again.')).toBeInTheDocument()
  })

  it('says the corridors could not be loaded', async () => {
    arrangeSignedIn()
    capture('get', '/api/corridor/list', 'boom', 500)
    open()
    expect(await screen.findByText("Couldn't load your corridors")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pick a corridor' })).toBeDisabled()
  })

  it('without any saved corridor, only the form to add one', async () => {
    arrangeSignedIn([])
    open()
    expect(await screen.findByRole('button', { name: 'Add corridor' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pick a corridor' })).toBeDisabled()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('lets the new corridor start from another country', async () => {
    arrangeSignedIn()
    const requests = capture('post', '/api/corridor/create', corridor())
    open()
    await screen.findByRole('button', { name: 'Add corridor' })
    await waitFor(() => expect(screen.getByLabelText('Destination')).toBeEnabled())
    await userEvent.selectOptions(screen.getByLabelText("I'm from"), poland.id)
    await userEvent.selectOptions(screen.getByLabelText('Destination'), serbia.id)
    await userEvent.click(screen.getByRole('button', { name: 'Add corridor' }))
    await waitFor(() => expect(requests).toHaveLength(1))
    expect(requests[0].body).toEqual({ from_country_id: poland.id, to_country_id: serbia.id })
  })

  it('names the corridors only once the countries are known', async () => {
    useAuthStore.getState().setAuth(authUser())
    capture('get', '/api/common/countries', [])
    capture('get', '/api/common/org_types', [])
    capture('get', '/api/corridor/list', list([home]))
    capture('get', `/api/corridor/stats/${home.id}`, stats(home))
    open()
    expect(await screen.findByRole('button', { name: /^Switch to/ })).toBeDisabled()
  })

  it('has no destination to choose before the countries load', () => {
    useAuthStore.getState().setAuth(authUser())
    capture('get', '/api/common/countries', [])
    capture('get', '/api/common/org_types', [])
    capture('get', '/api/corridor/list', list([]))
    open()
    expect(screen.getByLabelText('Destination')).toBeDisabled()
  })
})
