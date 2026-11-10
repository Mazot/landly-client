import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { organisation } from '@/test/factories'
import { renderApp } from '@/test/render'
import type { OrganisationType } from '@/types/api'
import { PlaceList, type PlaceListProps } from '../PlaceList'

const embassy: OrganisationType = { id: 'type-1', type: 'embassy', slug: 'embassy', title: 'Embassy', color: null }
const choir: OrganisationType = { id: 'type-2', type: 'choir', slug: null, title: null, color: '#123456' }

const render = (props: Partial<PlaceListProps> = {}) =>
  renderApp(
    <PlaceList places={[]} orgTypes={[embassy, choir]} onSelect={() => {}} compact={false} loading={false} error={false} narrowed={false} onResetFilters={() => {}} capped={false} {...props} />,
  )

describe('PlaceList', () => {
  it('lists the places, each with the type it belongs to', () => {
    render({
      places: [organisation({ name: 'Russian Embassy', organisationTypeId: 'type-1' }), organisation({ name: 'Choir Berlin', organisationTypeId: 'type-2' }), organisation({ name: 'Mystery', organisationTypeId: null })],
    })
    const rows = within(screen.getByRole('list', { name: 'Places on the map' })).getAllByRole('listitem')
    expect(rows).toHaveLength(3)
    expect(within(rows[0]).getByText('Embassy')).toBeInTheDocument()
    // A type without a title falls back to its key; a place without a type has no tag.
    expect(within(rows[1]).getByText('choir')).toBeInTheDocument()
    expect(within(rows[2]).queryByText('Embassy')).not.toBeInTheDocument()
    expect(screen.getByText('Move the map to search another area')).toBeInTheDocument()
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

  it('offers bookmarks to signed-in users only', async () => {
    const onToggleSaved = vi.fn()
    const places = [organisation({ name: 'First' }), organisation({ name: 'Second' })]
    const { unmount } = render({ places })
    expect(screen.queryByRole('button', { name: /^Save/ })).not.toBeInTheDocument()
    unmount()
    render({ places, isSaved: (place) => place.id === places[1].id, onToggleSaved })
    expect(screen.getByRole('button', { name: 'Save First' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Remove Second from saved' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Save First' }))
    expect(onToggleSaved).toHaveBeenCalledWith(places[0])
  })

  it('says when the search stopped at the page size', () => {
    render({ places: [organisation(), organisation()], capped: true })
    expect(screen.getByText('Showing the first 2 — zoom in to narrow the search')).toBeInTheDocument()
    expect(screen.queryByText('Move the map to search another area')).not.toBeInTheDocument()
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

  it('explains an empty result of filters or a search, and offers to reset them', async () => {
    const onResetFilters = vi.fn()
    render({ narrowed: true, onResetFilters })
    expect(screen.getByText('Nothing matches these filters')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Reset filters' }))
    expect(onResetFilters).toHaveBeenCalledOnce()
  })

  it('explains a failed search, whatever else is set', () => {
    render({ error: true, loading: true, places: [organisation()] })
    expect(screen.getByText("Couldn't load places")).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
