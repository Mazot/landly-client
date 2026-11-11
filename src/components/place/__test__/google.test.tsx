import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakePlaces } from '@/test/googlePlaces'
import { renderApp } from '@/test/render'
import { GooglePlaceSearch } from '../GooglePlaceSearch'
import { LocationPicker, PICKED_ZOOM } from '../LocationPicker'

const google = vi.hoisted(() => ({ places: null as unknown, map: null as unknown }))

vi.mock('@vis.gl/react-google-maps', async () => {
  const { createElement } = await import('react')
  return {
    useMapsLibrary: () => google.places,
    useMap: () => google.map,
    Map: ({ children, onClick, defaultBounds, defaultCenter, defaultZoom }: { children?: ReactNode; onClick: (event: unknown) => void; defaultBounds?: object; defaultCenter?: object; defaultZoom?: number }) =>
      createElement(
        'div',
        { 'data-testid': 'map', 'data-start': JSON.stringify(defaultBounds ?? { defaultCenter, defaultZoom }) },
        createElement('button', { onClick: () => onClick({ detail: { latLng: { lat: 44.8, lng: 20.4 } } }) }, 'tap the map'),
        createElement('button', { onClick: () => onClick({ detail: { latLng: null } }) }, 'tap off the map'),
        children,
      ),
    AdvancedMarker: ({ children, onDragEnd }: { children?: ReactNode; onDragEnd: (event: unknown) => void }) =>
      createElement(
        'div',
        null,
        createElement('button', { onClick: () => onDragEnd({ latLng: { toJSON: () => ({ lat: 44.9, lng: 20.5 }) } }) }, 'drag the pin'),
        createElement('button', { onClick: () => onDragEnd({ latLng: null }) }, 'drop the pin nowhere'),
        children,
      ),
  }
})

beforeEach(() => {
  google.places = null
  google.map = null
})

describe('GooglePlaceSearch', () => {
  it('suggests places near the destination and hands over the pick: its id and point only', async () => {
    const places = fakePlaces({ suggestions: [{ placeId: 'ChIJ1', main: 'Kalemegdan', secondary: 'Belgrade, Serbia', location: { lat: 44.82, lng: 20.45 } }, { placeId: 'ChIJ2', main: 'Ada' }] })
    google.places = places
    const onPick = vi.fn()
    const bias = { north: 46, south: 42, east: 23, west: 19 }
    renderApp(<GooglePlaceSearch bias={bias} onPick={onPick} />)

    const input = screen.getByRole('searchbox', { name: 'Search Google Maps' })
    await userEvent.click(input)
    await userEvent.type(input, 'Ka')
    expect(places.AutocompleteSuggestion.fetchAutocompleteSuggestions).not.toHaveBeenCalled()
    await userEvent.type(input, 'lemegdan')
    // The input is deferred: wait for the request with the whole text before picking.
    await waitFor(() =>
      expect(places.AutocompleteSuggestion.fetchAutocompleteSuggestions).toHaveBeenLastCalledWith(expect.objectContaining({ input: 'Kalemegdan', locationBias: bias, sessionToken: expect.any(places.AutocompleteSessionToken) })),
    )
    await userEvent.click(await screen.findByRole('button', { name: /Kalemegdan/ }))
    expect(onPick).toHaveBeenCalledWith({ placeId: 'ChIJ1', lat: 44.82, lng: 20.45 })
    expect(input).toHaveValue('')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('searches the place name of a pasted Google Maps link, without a bias when there is no area', async () => {
    const places = fakePlaces({ suggestions: [{ placeId: 'q', main: 'kyiv coffee near me', query: true }, { placeId: 'ChIJ3', main: 'Kyiv Coffee', plain: true }] })
    google.places = places
    const onPick = vi.fn()
    renderApp(<GooglePlaceSearch onPick={onPick} />)
    await userEvent.click(screen.getByRole('searchbox'))
    await userEvent.paste('https://www.google.com/maps/place/Kyiv+Coffee/@52.5,13.4,17z')
    await userEvent.click(await screen.findByRole('button', { name: 'Kyiv Coffee' }))
    expect(screen.queryByText('kyiv coffee near me')).not.toBeInTheDocument()
    const request = places.AutocompleteSuggestion.fetchAutocompleteSuggestions.mock.lastCall as unknown as [Record<string, unknown>]
    expect(request[0]).toMatchObject({ input: 'Kyiv Coffee' })
    expect(request[0]).not.toHaveProperty('locationBias')
    // A place Google has no point for gives nothing to pin.
    expect(onPick).not.toHaveBeenCalled()
  })

  it('sends every request in a billing session: one per pick, a new one for the next search', async () => {
    const places = fakePlaces({ suggestions: [{ placeId: 'ChIJ1', main: 'Kalemegdan', location: { lat: 44.82, lng: 20.45 } }] })
    google.places = places
    renderApp(<GooglePlaceSearch onPick={vi.fn()} />)
    const input = screen.getByRole('searchbox')
    // Typed without focusing first (focus stays after a pick, too).
    fireEvent.change(input, { target: { value: 'Kalem' } })
    await waitFor(() => expect(places.AutocompleteSuggestion.fetchAutocompleteSuggestions).toHaveBeenCalledTimes(1))
    fireEvent.change(input, { target: { value: 'Kalemegdan' } })
    await waitFor(() => expect(places.AutocompleteSuggestion.fetchAutocompleteSuggestions).toHaveBeenCalledTimes(2))
    await userEvent.click(await screen.findByRole('button', { name: /Kalemegdan/ }))
    fireEvent.change(input, { target: { value: 'Ada Ciganlija' } })
    await waitFor(() => expect(places.AutocompleteSuggestion.fetchAutocompleteSuggestions).toHaveBeenCalledTimes(3))

    const tokens = places.AutocompleteSuggestion.fetchAutocompleteSuggestions.mock.calls.map((call) => (call as unknown as [{ sessionToken?: unknown }])[0].sessionToken)
    expect(tokens.every((token) => token instanceof places.AutocompleteSessionToken)).toBe(true)
    expect(tokens[1]).toBe(tokens[0])
    expect(tokens[2]).not.toBe(tokens[0])
  })

  it('says when Google does not answer', async () => {
    google.places = fakePlaces({ fail: true })
    renderApp(<GooglePlaceSearch onPick={vi.fn()} />)
    await userEvent.type(screen.getByRole('searchbox'), 'Kalemegdan')
    expect(await screen.findByText("Google Maps didn't answer. Set the pin on the map instead.")).toBeInTheDocument()
  })

  it('asks nothing before the Places library is loaded', async () => {
    renderApp(<GooglePlaceSearch onPick={vi.fn()} />)
    await userEvent.click(screen.getByRole('searchbox'))
    await userEvent.type(screen.getByRole('searchbox'), 'Kalemegdan')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})

describe('LocationPicker', () => {
  const start = { north: 46, south: 42, east: 23, west: 19 }
  const fakeMap = (zoom: number | undefined = 6) => ({ panTo: vi.fn(), setZoom: vi.fn(), getZoom: () => zoom, fitBounds: vi.fn() })

  it('starts on the country, puts the pin where the map is tapped and where it is dragged to', async () => {
    const onChange = vi.fn()
    const { rerender } = renderApp(<LocationPicker value={null} onChange={onChange} start={start} label="" />)
    expect(screen.getByTestId('map')).toHaveAttribute('data-start', JSON.stringify(start))
    expect(screen.queryByRole('button', { name: 'drag the pin' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'tap the map' }))
    expect(onChange).toHaveBeenLastCalledWith({ lat: 44.8, lng: 20.4 })
    await userEvent.click(screen.getByRole('button', { name: 'tap off the map' }))
    expect(onChange).toHaveBeenCalledTimes(1)

    rerender(<LocationPicker value={{ lat: 44.8, lng: 20.4 }} onChange={onChange} start={start} label="Kyiv Coffee" />)
    expect(screen.getByLabelText('Kyiv Coffee')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'drag the pin' }))
    expect(onChange).toHaveBeenLastCalledWith({ lat: 44.9, lng: 20.5 })
    await userEvent.click(screen.getByRole('button', { name: 'drop the pin nowhere' }))
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('starts on the pin, or on the world without a country', () => {
    const { unmount } = renderApp(<LocationPicker value={{ lat: 1, lng: 2 }} onChange={vi.fn()} label="" />)
    expect(screen.getByTestId('map')).toHaveAttribute('data-start', JSON.stringify({ defaultCenter: { lat: 1, lng: 2 }, defaultZoom: PICKED_ZOOM }))
    unmount()
    renderApp(<LocationPicker value={null} onChange={vi.fn()} label="" />)
    expect(JSON.parse(screen.getByTestId('map').getAttribute('data-start')!)).toHaveProperty('defaultZoom', 2)
  })

  it('fits a country that arrives later, and centres on a point set from outside', () => {
    const map = fakeMap()
    google.map = map
    const { rerender } = renderApp(<LocationPicker value={null} onChange={vi.fn()} label="" />)
    expect(map.fitBounds).not.toHaveBeenCalled()
    rerender(<LocationPicker value={null} onChange={vi.fn()} start={start} label="" />)
    expect(map.fitBounds).toHaveBeenCalledWith(start)

    act(() => rerender(<LocationPicker value={{ lat: 44.8, lng: 20.4 }} onChange={vi.fn()} start={start} label="" />))
    expect(map.panTo).toHaveBeenCalledWith({ lat: 44.8, lng: 20.4 })
    expect(map.setZoom).toHaveBeenCalledWith(PICKED_ZOOM)
    expect(map.fitBounds).toHaveBeenCalledTimes(1)
  })

  it('keeps a closer zoom', () => {
    const map = fakeMap(PICKED_ZOOM + 2)
    google.map = map
    renderApp(<LocationPicker value={{ lat: 44.8, lng: 20.4 }} onChange={vi.fn()} label="" />)
    expect(map.panTo).toHaveBeenCalled()
    expect(map.setZoom).not.toHaveBeenCalled()
  })

  it('treats a map without a zoom as far out', () => {
    const map = { ...fakeMap(), getZoom: () => undefined }
    google.map = map
    renderApp(<LocationPicker value={{ lat: 44.8, lng: 20.4 }} onChange={vi.fn()} label="" />)
    expect(map.setZoom).toHaveBeenCalledWith(PICKED_ZOOM)
  })
})
