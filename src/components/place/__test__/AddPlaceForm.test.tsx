import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { country, image, list, organisation } from '@/test/factories'
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
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ id: 'new-place' }), { uploaded: 0, failed: 0 }))
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

describe('AddPlaceForm: photos', () => {
  const png = (name: string) => new File(['x'], name, { type: 'image/png' })
  const pick = (...files: File[]) => userEvent.upload(screen.getByTestId('dropzone-input'), files)
  const fillRequired = async () => {
    await userEvent.click(screen.getByRole('button', { name: 'tap the map' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'Corner shop')
    await userEvent.click(await screen.findByRole('button', { name: 'Business' }))
  }

  it('does not create the place twice when submitted again while its photos are going up', async () => {
    const created = arrange()
    server.use(http.post(`${API}/api/images/upload/new-place`, () => new Promise(() => {})))
    const { container } = render()
    await fillRequired()
    await pick(png('a.png'))
    await submit()
    await waitFor(() => expect(created).toHaveLength(1))
    // Enter in a text field submits the form once more while the upload is still running.
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(created).toHaveLength(1)
  })

  it('queues the picked photos: the first is the cover, "Make cover" moves one to the front, ✕ drops one', async () => {
    arrange()
    const revoke = vi.spyOn(URL, 'revokeObjectURL')
    render()
    await pick(png('a.png'), png('b.png'), png('c.png'))
    const list = screen.getByRole('list', { name: 'Photos' })
    expect(within(list).getAllByRole('img').map((img) => img.getAttribute('alt'))).toEqual(['a.png', 'b.png', 'c.png'])
    expect(within(list).getAllByText('Cover')).toHaveLength(1)

    await userEvent.click(within(list).getByRole('button', { name: 'Make c.png the cover' }))
    expect(within(list).getAllByRole('img').map((img) => img.getAttribute('alt'))).toEqual(['c.png', 'a.png', 'b.png'])
    await userEvent.click(within(list).getByRole('button', { name: 'Remove a.png' }))
    expect(within(list).getAllByRole('img').map((img) => img.getAttribute('alt'))).toEqual(['c.png', 'b.png'])
    expect(revoke).toHaveBeenCalled()
  })

  it('refuses files of another type and says so', async () => {
    arrange()
    renderApp(<AddPlaceForm size="phone" corridor={{ fromId: russia.id, toId: serbia.id }} onCreated={vi.fn()} />)
    await userEvent.setup({ applyAccept: false }).upload(screen.getByTestId('dropzone-input'), [new File(['x'], 'notes.pdf', { type: 'application/pdf' })])
    expect(await screen.findByText("1 photo couldn't be added")).toBeInTheDocument()
    await pick(png('a.png'))
    expect(screen.queryByText("1 photo couldn't be added")).not.toBeInTheDocument()
  })

  it('sends the queued photos once the place exists — the first as the cover — and tells how many made it', async () => {
    const created = arrange()
    const flags: (string | undefined)[] = []
    let calls = 0
    server.use(
      http.post(`${API}/api/images/upload/new-place`, async ({ request }) => {
        calls += 1
        flags.push(/name="is_primary"\r\n\r\n(\w+)/.exec(await request.text())?.[1])
        return calls === 2 ? HttpResponse.json({ error: 'bad' }, { status: 422 }) : HttpResponse.json({})
      }),
    )
    const { onCreated } = render()
    await fillRequired()
    await pick(png('a.png'), png('b.png'), png('c.png'))
    await submit()
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ id: 'new-place' }), { uploaded: 2, failed: 1 }))
    expect(created).toHaveLength(1)
    expect(flags).toEqual(['true', 'false', 'false'])
  })
})

describe('AddPlaceForm: editing a place', () => {
  const mine = organisation({
    id: 'my-place',
    name: 'Svetofor',
    status: 'live',
    organisationTypeId: business.id,
    locationCountryId: serbia.id,
    founderCountryId: russia.id,
    address: 'Viline vode 47',
    tel: '+381 11 555',
    services: ['Groceries'],
    googlePlaceId: 'ChIJ-svetofor',
    latitude: 44.8198,
    longitude: 20.4864,
    openingHours: { mon: [['08:00', '20:00']] },
  })
  const renderEdit = (place = mine, onSaved = vi.fn()) => ({ onSaved, ...renderApp(<AddPlaceForm size="phone" place={place} onSaved={onSaved} />) })
  const save = () => userEvent.click(screen.getByRole('button', { name: 'Save changes' }))
  const arrangeEdit = (status = 200, error: object = {}) => {
    arrange()
    return capture('put', '/api/organisation/update/my-place', status === 200 ? { ...mine, name: 'Svetofor Market' } : error, status)
  }

  it('fills the form from the place, without the Google search, and warns that a live place goes back to review', async () => {
    arrangeEdit()
    renderEdit()
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Svetofor')
    expect(screen.getByRole('textbox', { name: 'Address' })).toHaveValue('Viline vode 47')
    expect(screen.getByRole('textbox', { name: /Phone/ })).toHaveValue('+381 11 555')
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Located in' })).toHaveValue(serbia.id))
    expect(screen.getByRole('switch', { name: 'Open on Mon' })).toBeChecked()
    expect(screen.getByLabelText('Mon opens at')).toHaveValue('08:00')
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    expect(screen.getByText(/goes back to review/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Submit for review' })).not.toBeInTheDocument()
  })

  it('saves the changes — cleared fields as "" — without the point, which stayed', async () => {
    const saved = arrangeEdit()
    const { onSaved } = renderEdit()
    await userEvent.clear(screen.getByRole('textbox', { name: 'Name' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'Svetofor Market')
    await userEvent.clear(screen.getByRole('textbox', { name: /Phone/ }))
    await save()

    await waitFor(() => expect(saved).toHaveLength(1))
    expect(saved[0].body).toEqual({
      name: 'Svetofor Market',
      organisation_type_id: business.id,
      address: 'Viline vode 47',
      tel: '',
      email: '',
      website: '',
      description: '',
      services: ['Groceries'],
      languages: [],
      location_country_id: serbia.id,
      founder_country_id: russia.id,
    })
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ id: 'my-place', name: 'Svetofor Market' })))
  })

  it('sends the point once the pin was moved', async () => {
    const saved = arrangeEdit()
    renderEdit()
    await userEvent.click(screen.getByRole('button', { name: 'tap the map' }))
    await save()
    await waitFor(() => expect(saved).toHaveLength(1))
    expect(saved[0].body).toMatchObject({ latitude: 44.81, longitude: 20.46 })
  })

  it('shows what went wrong, and needs no warning for a place that is not live yet', async () => {
    arrangeEdit(422, { error: 'name: too long' })
    renderEdit({ ...mine, status: 'pending' })
    expect(screen.queryByText(/goes back to review/)).not.toBeInTheDocument()
    await save()
    expect(await screen.findByText('name: too long')).toBeInTheDocument()
  })

  it('asks for the pin of a place that has none yet', async () => {
    const saved = arrangeEdit()
    renderEdit({ ...mine, latitude: null, longitude: null })
    await save()
    expect(await screen.findByText('Set the pin on the map or pick the place on Google Maps')).toBeInTheDocument()
    expect(saved).toHaveLength(0)
  })

  it('manages the photos of the place at once: add (cover kept), make cover, remove, and a load failure', async () => {
    arrangeEdit()
    const cover = image({ id: 'i1', organisationId: 'my-place', fileName: 'front.jpg', isPrimary: true })
    const other = image({ id: 'i2', organisationId: 'my-place', fileName: 'inside.jpg', isPrimary: false })
    capture('get', '/api/images/list/my-place', list([cover, other]))
    const primary = capture('put', '/api/images/set-primary/i2', other)
    const removed = capture('delete', '/api/images/delete/i1', null)
    const flags: (string | undefined)[] = []
    server.use(http.post(`${API}/api/images/upload/my-place`, async ({ request }) => (flags.push(/name="is_primary"\r\n\r\n(\w+)/.exec(await request.text())?.[1]), HttpResponse.json(image()))))
    renderEdit()

    const photos = within(await screen.findByRole('list', { name: 'Photos' }))
    expect(photos.getAllByText('Cover')).toHaveLength(1)
    expect(screen.getByText('Changes to photos are saved right away.')).toBeInTheDocument()
    await userEvent.upload(screen.getByTestId('dropzone-input'), [new File(['x'], 'new.png', { type: 'image/png' })])
    await waitFor(() => expect(flags).toEqual(['false']))
    await userEvent.click(photos.getByRole('button', { name: 'Make inside.jpg the cover' }))
    await waitFor(() => expect(primary).toHaveLength(1))
    await userEvent.click(photos.getByRole('button', { name: 'Remove front.jpg' }))
    await waitFor(() => expect(removed).toHaveLength(1))
  })

  it('says when the place photos cannot be loaded, and what a refused file was', async () => {
    arrangeEdit()
    capture('get', '/api/images/list/my-place', { error: 'boom' }, 500)
    renderEdit()
    expect(await screen.findByText("Couldn't load the photos")).toBeInTheDocument()
  })

  it('refuses a file of another type before sending it', async () => {
    arrangeEdit()
    capture('get', '/api/images/list/my-place', list([]))
    renderEdit()
    await screen.findByTestId('dropzone-input')
    await userEvent.setup({ applyAccept: false }).upload(screen.getByTestId('dropzone-input'), [new File(['x'], 'notes.pdf', { type: 'application/pdf' })])
    expect(await screen.findByText("1 photo couldn't be added")).toBeInTheDocument()
  })

  it('says so when making a cover or removing a photo fails, and asks the server for its largest page', async () => {
    arrangeEdit()
    const photos = capture('get', '/api/images/list/my-place', list([image({ id: 'i1', organisationId: 'my-place', fileName: 'front.jpg', isPrimary: false })]))
    capture('put', '/api/images/set-primary/i1', { error: 'boom' }, 500)
    capture('delete', '/api/images/delete/i1', { error: 'boom' }, 500)
    renderEdit()
    const list_ = within(await screen.findByRole('list', { name: 'Photos' }))
    expect(photos[0].query.get('limit')).toBe('100')
    await userEvent.click(list_.getByRole('button', { name: 'Make front.jpg the cover' }))
    expect(await screen.findByText("Couldn't update the photos. Try again.")).toBeInTheDocument()
    await userEvent.click(list_.getByRole('button', { name: 'Remove front.jpg' }))
    expect(await screen.findByText("Couldn't update the photos. Try again.")).toBeInTheDocument()
  })

  it('counts the photos the server refused', async () => {
    arrangeEdit()
    capture('get', '/api/images/list/my-place', list([]))
    capture('post', '/api/images/upload/my-place', { error: 'bad' }, 422)
    renderEdit()
    await screen.findByTestId('dropzone-input')
    await userEvent.upload(screen.getByTestId('dropzone-input'), [new File(['x'], 'new.png', { type: 'image/png' })])
    expect(await screen.findByText("1 photo couldn't be added")).toBeInTheDocument()
  })
})

