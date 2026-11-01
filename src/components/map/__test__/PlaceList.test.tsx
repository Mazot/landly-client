import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { organisation } from '@/test/factories'
import { renderApp } from '@/test/render'
import type { OrganisationType } from '@/types/api'
import { PlaceList, type PlaceListProps } from '../PlaceList'

const embassy: OrganisationType = { id: 'type-1', type: 'embassy', slug: 'embassy', title: 'Embassy', color: null }
const untitled: OrganisationType = { id: 'type-2', type: 'choir', slug: null, title: null, color: '#123456' }

const render = (props: Partial<PlaceListProps> = {}) =>
  renderApp(<PlaceList places={[]} orgTypes={[embassy, untitled]} onSelect={() => {}} loading={false} error={false} {...props} />)

describe('PlaceList', () => {
  it('lists the places with address, type, rating and open status', () => {
    render({
      places: [
        organisation({ name: 'Russian Embassy', address: 'Unter den Linden 63', organisationTypeId: 'type-1', ratingAvg: 4.5, reviewsCount: 12, openNow: true, verified: true }),
        organisation({ name: 'Choir Berlin', address: null, city: 'Berlin', organisationTypeId: 'type-2' }),
        organisation({ name: 'Mystery place', organisationTypeId: null }),
      ],
    })
    const list = screen.getByRole('list', { name: 'Places on the map' })
    const rows = within(list).getAllByRole('listitem')
    expect(rows).toHaveLength(3)

    expect(within(rows[0]).getByText('Russian Embassy')).toBeInTheDocument()
    expect(within(rows[0]).getByText('Unter den Linden 63')).toBeInTheDocument()
    expect(within(rows[0]).getByText('Embassy')).toBeInTheDocument()
    expect(within(rows[0]).getByText('4.5')).toBeInTheDocument()
    expect(within(rows[0]).getByText('Open now')).toBeInTheDocument()
    expect(within(rows[0]).getByText('Verified')).toBeInTheDocument()

    // No address → the city; a type without a title falls back to its key; no type → no tag.
    expect(within(rows[1]).getByText('Berlin')).toBeInTheDocument()
    expect(within(rows[1]).getByText('choir')).toBeInTheDocument()
    expect(within(rows[1]).queryByText('Verified')).not.toBeInTheDocument()
    expect(within(rows[2]).queryByText('Embassy')).not.toBeInTheDocument()
  })

  it('hands the clicked place to the caller and marks the selected one', async () => {
    const onSelect = vi.fn()
    const places = [organisation({ name: 'First' }), organisation({ name: 'Second' })]
    render({ places, selectedId: places[1].id, onSelect })

    await userEvent.click(screen.getByRole('button', { name: /First/ }))
    expect(onSelect).toHaveBeenCalledWith(places[0])
    expect(screen.getByRole('button', { name: /Second/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /First/ })).toHaveAttribute('aria-pressed', 'false')
  })

  it('says it is loading', () => {
    render({ loading: true })
    expect(screen.getByRole('status')).toHaveTextContent('Loading organizations…')
  })

  it('explains an empty area', () => {
    render()
    expect(screen.getByText('No organizations here yet.')).toBeInTheDocument()
    expect(screen.getByText('Zoom out or move the map to look elsewhere.')).toBeInTheDocument()
  })

  it('explains a failed search, whatever else is set', () => {
    render({ error: true, loading: true, places: [organisation()] })
    expect(screen.getByText("Couldn't load places")).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
