import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { country, list, organisation } from '@/test/factories'
import { fakePlaces } from '@/test/googlePlaces'
import { renderApp } from '@/test/render'
import { API, capture, server } from '@/test/server'
import type { Breakpoint } from '@/lib/useBreakpoint'
import { AddPlaceForm } from '../AddPlaceForm'

const google = vi.hoisted(() => ({ places: null as unknown }))

vi.mock('@vis.gl/react-google-maps', async () => {
  const { createElement } = await import('react')
  return {
    useMapsLibrary: () => google.places,
    useMap: () => null,
    Map: ({ children, onClick }: { children?: ReactNode; onClick: (event: unknown) => void }) =>
      createElement('div', { 'data-testid': 'map' }, createElement('button', { type: 'button', onClick: () => onClick({ detail: { latLng: { lat: 44.81, lng: 20.46 } } }) }, 'tap the map'), children),
    AdvancedMarker: ({ children }: { children?: ReactNode }) => createElement('div', null, children),
  }
})

const russia = country({ name: 'Russia', flag: '🇷🇺' })
const serbia = country({ name: 'Serbia', flag: '🇷🇸' })
const business = { id: 'type-business', type: 'business', slug: 'business', title: 'Business', color: null }
const choir = { id: 'type-choir', type: 'choir', slug: null, title: null, color: null }

/** The reference data the form loads, and the create endpoint; returns the create requests. */
function arrange({ status = 200, error = {} as object } = {}) {
  capture('get', '/api/common/org_types', [business, choir])
  capture('get', '/api/common/countries', [russia, serbia])
  capture('get', '/api/common/languages', [{ id: 'l1', name: 'Serbian', symbol: 'srp' }])
  capture('get', '/api/common/timezone', { timezone: 'Europe/Belgrade' })
  capture('get', '/api/organisation/duplicates', list([]))
  server.use(http.get(`${API}/api/common/countries/:id`, () => HttpResponse.json({ ...serbia, geoJson: null, totalPlaces: 0, placesByType: [] })))
  return capture('post', '/api/organisation/create', status === 200 ? organisation({ id: 'new-place', status: 'pending' }) : error, status)
}

const render = (size: Breakpoint = 'phone', onCreated = vi.fn()) => ({
  onCreated,
  ...renderApp(<AddPlaceForm size={size} corridor={{ fromId: russia.id, toId: serbia.id }} onCreated={onCreated} />),
})

const submit = () => userEvent.click(screen.getByRole('button', { name: 'Submit for review' }))

beforeEach(() => {
  google.places = fakePlaces({
    suggestions: [{ placeId: 'ChIJ-svetofor', main: 'Svetofor', secondary: 'Belgrade', location: { lat: 44.8198, lng: 20.4864 } }],
    details: { 'ChIJ-svetofor': { displayName: 'Svetofor', formattedAddress: 'Viline vode 47, Belgrade' } },
  })
})

describe('AddPlaceForm', () => {
  it('asks for the name, the type and the point before sending anything', async () => {
    const created = arrange()
    render()
    await submit()
    expect(await screen.findByText('Enter the name of the place')).toBeInTheDocument()
    expect(screen.getByText('Choose a type')).toBeInTheDocument()
    expect(screen.getByText('Set the pin on the map or pick the place on Google Maps')).toBeInTheDocument()
    expect(created).toHaveLength(0)
  })

  it('submits a place picked on Google Maps with the corridor, the hours and the lists — and no Google content', async () => {
    const created = arrange()
    const { onCreated } = render()

    await userEvent.click(screen.getByRole('searchbox', { name: 'Search Google Maps' }))
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search Google Maps' }), 'Svetofor')
    await userEvent.click(await screen.findByRole('button', { name: /Svetofor/ }))
    // Google's own name and address are shown live, not copied into the form.
    expect(await screen.findByText('Viline vode 47, Belgrade')).toBeInTheDocument()
    expect(await screen.findByText('Time zone: Europe/Belgrade — used to show “Open now”')).toBeInTheDocument()

    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), '  Svetofor Market ')
    await userEvent.click(await screen.findByRole('button', { name: 'Business' }))
    await userEvent.type(screen.getByRole('textbox', { name: /Phone/ }), '+381 11 555')
    await userEvent.click(screen.getByRole('button', { name: /Add/ }))
    await userEvent.type(screen.getByRole('textbox', { name: 'e.g. Breakfast' }), 'Groceries{Enter}')
    await userEvent.click(await within(screen.getByRole('group', { name: 'Languages spoken' })).findByRole('button', { name: 'Serbian' }))
    await userEvent.click(screen.getByRole('switch', { name: 'Open on Mon' }))
    fireEvent.change(screen.getByLabelText('Mon opens at'), { target: { value: '08:00' } })
    fireEvent.change(screen.getByLabelText('Mon closes at'), { target: { value: '20:00' } })
    // Friday runs past midnight: it is sent split, the night on Saturday.
    await userEvent.click(screen.getByRole('switch', { name: 'Open on Fri' }))
    fireEvent.change(screen.getByLabelText('Fri opens at'), { target: { value: '18:00' } })
    fireEvent.change(screen.getByLabelText('Fri closes at'), { target: { value: '02:00' } })
    await submit()

    await waitFor(() => expect(created).toHaveLength(1))
    expect(created[0].body).toEqual({
      name: 'Svetofor Market',
      organisation_type_id: 'type-business',
      tel: '+381 11 555',
      services: ['Groceries'],
      languages: ['Serbian'],
      opening_hours: { mon: [['08:00', '20:00']], fri: [['18:00', '24:00']], sat: [['00:00', '02:00']] },
      location_country_id: serbia.id,
      founder_country_id: russia.id,
      latitude: 44.8198,
      longitude: 20.4864,
      google_place_id: 'ChIJ-svetofor',
    })
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ id: 'new-place' })))
  })

  it('takes a pin set on the map, and drops the Google link on "Unlink"', async () => {
    const created = arrange()
    render()
    await userEvent.click(screen.getByRole('searchbox'))
    await userEvent.type(screen.getByRole('searchbox'), 'Svetofor')
    await userEvent.click(await screen.findByRole('button', { name: /Svetofor/ }))
    await userEvent.click(await screen.findByRole('button', { name: 'Unlink' }))
    expect(screen.queryByText('Viline vode 47, Belgrade')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'tap the map' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'Corner shop')
    await userEvent.click(await screen.findByRole('button', { name: 'Business' }))
    await submit()
    await waitFor(() => expect(created).toHaveLength(1))
    expect(created[0].body).toMatchObject({ latitude: 44.81, longitude: 20.46 })
    expect(created[0].body).not.toHaveProperty('google_place_id')
  })

  it('shows a linked place without its Google details until they arrive', async () => {
    arrange()
    google.places = fakePlaces({ suggestions: [{ placeId: 'ChIJ-x', main: 'Somewhere', location: { lat: 1, lng: 2 } }] })
    render()
    await userEvent.click(screen.getByRole('searchbox'))
    await userEvent.type(screen.getByRole('searchbox'), 'Somewhere')
    await userEvent.click(await screen.findByRole('button', { name: 'Somewhere' }))
    expect(await screen.findByText('Linked to Google Maps')).toBeInTheDocument()
  })

  it('sends nothing while the point is missing, even when the rest is right', async () => {
    const created = arrange()
    render()
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'Corner shop')
    await userEvent.click(await screen.findByRole('button', { name: 'Business' }))
    await submit()
    expect(await screen.findByText('Set the pin on the map or pick the place on Google Maps')).toBeInTheDocument()
    expect(created).toHaveLength(0)
  })

  it('checks the email, and sends the description and a changed country', async () => {
    const created = arrange()
    render()
    await userEvent.click(screen.getByRole('button', { name: 'tap the map' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'Corner shop')
    await userEvent.click(await screen.findByRole('button', { name: 'Business' }))
    await userEvent.type(screen.getByRole('textbox', { name: /Email/ }), 'not-an-email')
    await submit()
    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument()
    expect(created).toHaveLength(0)

    await userEvent.clear(screen.getByRole('textbox', { name: /Email/ }))
    await userEvent.type(screen.getByRole('textbox', { name: /Email/ }), 'hi@corner.rs')
    await userEvent.type(screen.getByRole('textbox', { name: /Description/ }), 'Russian groceries')
    const to = screen.getByRole('combobox', { name: 'Located in' })
    await within(to).findByRole('option', { name: /Russia/ })
    await userEvent.selectOptions(to, russia.id)
    await submit()
    await waitFor(() => expect(created).toHaveLength(1))
    expect(created[0].body).toMatchObject({ email: 'hi@corner.rs', description: 'Russian groceries', location_country_id: russia.id })
  })

  it('says what is wrong with the hours once a submit was tried', async () => {
    arrange()
    render()
    await userEvent.click(screen.getByRole('switch', { name: 'Open on Mon' }))
    expect(screen.queryByText(/Check the hours/)).not.toBeInTheDocument()
    await submit()
    expect(await screen.findByText("Check the hours: each open day needs an opening and a closing time, and they can't be the same")).toBeInTheDocument()
  })

  it.each([
    [429, {}, "You've submitted a lot of places — wait until moderators review them, or try again tomorrow."],
    [503, {}, 'Google Maps is unavailable right now. Try again in a minute.'],
    [422, { error: 'Unique constraint violated', constraint: 'organisations_google_place_id_key' }, 'This Google Maps place is already on Landly.'],
    [422, { error: 'website must be at most 2048 characters' }, 'website must be at most 2048 characters'],
    [422, {}, "Couldn't submit the place. Please try again."],
    [500, {}, "Couldn't submit the place. Please try again."],
  ])('explains a %s answer', async (status, error, message) => {
    arrange({ status, error })
    render()
    await userEvent.click(screen.getByRole('button', { name: 'tap the map' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'Corner shop')
    await userEvent.click(await screen.findByRole('button', { name: 'Business' }))
    await submit()
    expect(await screen.findByText(message)).toBeInTheDocument()
  })

  it('keeps the map, a preview and the submit button in a side card on desktop', async () => {
    arrange()
    render('desktop')
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'Svetofor Market')
    await userEvent.click(await screen.findByRole('button', { name: 'Business' }))
    const aside = screen.getByRole('complementary')
    expect(within(aside).getByTestId('map')).toBeInTheDocument()
    expect(within(aside).getByText('Svetofor Market')).toBeInTheDocument()
    expect(within(aside).getByText('Business')).toBeInTheDocument()
    expect(within(aside).getByText('Pending review')).toBeInTheDocument()
    // The preview only shows the draft: it is not a button.
    expect(within(aside).queryByRole('button', { name: /Svetofor Market/ })).not.toBeInTheDocument()
    expect(within(aside).getByRole('button', { name: 'Submit for review' })).toBeInTheDocument()
    expect(within(aside).getByText('You can add photos right after submitting.')).toBeInTheDocument()
  })

  it('calls an untitled draft "New place" in the preview, and names a type without a title by its key', async () => {
    arrange()
    render('desktop')
    await userEvent.click(await screen.findByRole('button', { name: 'choir' }))
    expect(within(screen.getByRole('complementary')).getByText('New place')).toBeInTheDocument()
    expect(within(screen.getByRole('complementary')).getByText('choir')).toBeInTheDocument()
  })

  it('leaves the countries to choose when there is no corridor yet', async () => {
    arrange()
    renderApp(<AddPlaceForm size="phone" corridor={{ fromId: undefined, toId: undefined }} onCreated={vi.fn()} />)
    await submit()
    await waitFor(() => expect(screen.getAllByRole('alert').filter((alert) => alert.textContent === 'Choose a country')).toHaveLength(2))
    const from = screen.getByRole('combobox', { name: 'Community from' })
    await within(from).findByRole('option', { name: /Russia/ })
    await userEvent.selectOptions(from, russia.id)
    expect(from).toHaveValue(russia.id)
  })
})
