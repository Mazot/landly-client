import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { authUser, corridor, country } from '@/test/factories'
import { renderApp } from '@/test/render'
import { capture } from '@/test/server'
import type { OrganisationType } from '@/types/api'
import { CorridorCard, type CorridorCardProps } from '../CorridorCard'

const russia = country({ name: 'Russia', flag: '🇷🇺' })
const serbia = country({ name: 'Serbia', flag: '🇷🇸' })
const types: OrganisationType[] = [{ id: '1', type: 'embassy', slug: 'embassy', title: 'Embassy', color: null }]

const stats = (id: string) => ({ corridorId: id, fromCountryId: russia.id, toCountryId: serbia.id, totalPlaces: 47, newThisWeek: 6, byType: [{ slug: 'embassy', count: 3 }, { slug: 'business', count: 44 }] })

function setup(props: Partial<CorridorCardProps> = {}, { withStats = true } = {}) {
  useAuthStore.getState().setAuth(authUser())
  const saved = props.corridor ?? corridor({ fromCountryId: russia.id, toCountryId: serbia.id })
  if (withStats) capture('get', `/api/corridor/stats/${saved.id}`, stats(saved.id))
  const handlers = { onSelect: vi.fn(), onSetDefault: vi.fn() }
  renderApp(<CorridorCard corridor={saved} from={russia} to={serbia} orgTypes={types} selected={false} settingDefault={false} {...handlers} {...props} />)
  return { saved, ...handlers }
}

describe('CorridorCard', () => {
  it('shows the corridor, its live places and what is new, and the split by type', async () => {
    setup()
    const row = screen.getByRole('button', { name: /^Russia → Serbia/ })
    expect(within(row).getByRole('img', { name: 'Russia → Serbia' })).toBeInTheDocument()
    expect(await within(row).findByText('47 live places · 6 new this week')).toBeInTheDocument()
    // Type titles come from the org types; a type without a title falls back to its slug.
    expect(within(row).getByText('Embassy')).toBeInTheDocument()
    expect(within(row).getByText('business')).toBeInTheDocument()
  })

  it('shows neither figures nor a bar until the stats arrive', () => {
    setup({}, { withStats: false })
    const row = screen.getByRole('button', { name: /^Russia → Serbia/ })
    expect(within(row).queryByText(/live places/)).not.toBeInTheDocument()
    expect(within(row).queryByRole('list')).not.toBeInTheDocument()
  })

  it('marks the default corridor with a badge instead of an action', () => {
    setup({ corridor: corridor({ fromCountryId: russia.id, toCountryId: serbia.id, isDefault: true }) })
    expect(screen.getByText('Default')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Make/ })).not.toBeInTheDocument()
  })

  it('offers "Set default" on the others, outside the row, without selecting it', async () => {
    const { saved, onSelect, onSetDefault } = setup()
    const action = screen.getByRole('button', { name: 'Make Russia → Serbia the default corridor' })
    expect(screen.getByRole('button', { name: /^Russia → Serbia/ }).contains(action)).toBe(false)
    await userEvent.click(action)
    expect(onSetDefault).toHaveBeenCalledWith(saved)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('is picked by a click, and shows it is the picked one', async () => {
    const { saved, onSelect } = setup({ selected: true })
    const row = screen.getByRole('button', { name: /^Russia → Serbia/ })
    expect(row).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(row)
    expect(onSelect).toHaveBeenCalledWith(saved)
  })

  it('shows the request in progress on "Set default"', () => {
    setup({ settingDefault: true })
    expect(screen.getByRole('button', { name: /Make/ })).toBeDisabled()
  })

  it('names a type without a title by its key', () => {
    setup({ orgTypes: [{ id: '1', type: 'Embassy (legacy)', slug: 'embassy', title: null, color: null }] })
    expect(screen.getByRole('button', { name: /^Russia → Serbia/ })).toBeInTheDocument()
  })

  it('copes with countries that have not loaded yet', () => {
    setup({ from: undefined, to: undefined })
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })

  it('copes with countries that have no flag', () => {
    setup({ from: { ...russia, flag: null }, to: { ...serbia, flag: null } })
    expect(screen.getByRole('img', { name: 'Russia → Serbia' })).toBeInTheDocument()
  })
})
