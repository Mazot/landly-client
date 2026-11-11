import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_FILTERS } from '@/lib/mapFilters'
import { renderApp } from '@/test/render'
import type { OrganisationType } from '@/types/api'
import { MapToolbar, type MapToolbarProps } from '../MapToolbar'

const types: OrganisationType[] = [
  { id: '1', type: 'embassy', slug: 'embassy', title: 'Embassy', color: null },
  { id: '2', type: 'business', slug: 'business', title: 'Business', color: null },
]
const corridor = { from: '🇷🇺', to: '🇩🇪', label: 'Russia → Germany', name: 'Germany', onOpen: vi.fn() }

const setup = (props: Partial<MapToolbarProps> = {}) => {
  const handlers = { onFiltersChange: vi.fn(), onQueryChange: vi.fn(), onOpenFilters: vi.fn() }
  renderApp(<MapToolbar size="desktop" filters={DEFAULT_FILTERS} orgTypes={types} query="" activeCount={0} {...handlers} {...props} />)
  return handlers
}

describe('MapToolbar · desktop', () => {
  it('has search, the type rail, quick filters and the filters button', () => {
    setup()
    expect(screen.getByRole('searchbox', { name: 'Search places' })).toHaveAttribute('placeholder', 'Search organizations, cities…')
    expect(screen.getByRole('group', { name: 'Place types' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open now' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Verified' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'More filters' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Filters/ })).not.toBeInTheDocument()
  })

  it('toggles open now and verified, keeping the other filters', async () => {
    const { onFiltersChange } = setup({ filters: { ...DEFAULT_FILTERS, addedBy: 'official' } })
    await userEvent.click(screen.getByRole('button', { name: 'Open now' }))
    expect(onFiltersChange).toHaveBeenLastCalledWith({ ...DEFAULT_FILTERS, addedBy: 'official', openNow: true })
    await userEvent.click(screen.getByRole('button', { name: 'Verified' }))
    expect(onFiltersChange).toHaveBeenLastCalledWith({ ...DEFAULT_FILTERS, addedBy: 'official', verified: true })
  })

  it('shows them pressed when on', () => {
    setup({ filters: { ...DEFAULT_FILTERS, openNow: true, verified: true } })
    expect(screen.getByRole('button', { name: 'Open now' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Verified' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('counts the active filters on the button, which opens the filters', async () => {
    const { onOpenFilters } = setup({ activeCount: 4 })
    await userEvent.click(screen.getByRole('button', { name: 'More filters · 4' }))
    expect(onOpenFilters).toHaveBeenCalledOnce()
  })

  it('reports the search text and the chosen types', async () => {
    const { onQueryChange, onFiltersChange } = setup()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'bakery' } })
    expect(onQueryChange).toHaveBeenCalledWith('bakery')
    await userEvent.click(screen.getByRole('button', { name: 'Embassy' }))
    expect(onFiltersChange).toHaveBeenLastCalledWith({ ...DEFAULT_FILTERS, types: ['embassy'] })
  })
})

describe('MapToolbar · tablet', () => {
  it('has search with a filters button, then the type rail — no quick filters', async () => {
    const { onOpenFilters } = setup({ size: 'tablet' })
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Place types' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Open now' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Filters' }))
    expect(onOpenFilters).toHaveBeenCalledOnce()
  })

  it('counts the active filters', () => {
    setup({ size: 'tablet', activeCount: 2 })
    expect(screen.getByRole('button', { name: 'Filters · 2' })).toBeInTheDocument()
  })
})

describe('MapToolbar · phone', () => {
  it('has a floating search for the destination, a filters button, the corridor pill and the rail', async () => {
    const { onOpenFilters } = setup({ size: 'phone', destination: 'Germany', corridor, activeCount: 1 })
    expect(screen.getByRole('searchbox')).toHaveAttribute('placeholder', 'Search in Germany')
    await userEvent.click(screen.getByRole('button', { name: 'Filters · 1' }))
    expect(onOpenFilters).toHaveBeenCalledOnce()
    await userEvent.click(screen.getByRole('button', { name: /Germany/ }))
    expect(corridor.onOpen).toHaveBeenCalledOnce()
    expect(screen.getByRole('group', { name: 'Place types' })).toBeInTheDocument()
  })

  it('reports the text typed into the floating search', () => {
    const { onQueryChange } = setup({ size: 'phone' })
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'bak' } })
    expect(onQueryChange).toHaveBeenCalledWith('bak')
  })

  it('works before the corridor is known', () => {
    setup({ size: 'phone' })
    expect(screen.queryByRole('button', { name: /→/ })).not.toBeInTheDocument()
    expect(screen.getByRole('searchbox')).toHaveAttribute('placeholder', 'Search in ')
    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument()
  })
})
