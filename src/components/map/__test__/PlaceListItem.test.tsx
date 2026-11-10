import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { organisation } from '@/test/factories'
import { renderApp } from '@/test/render'
import type { OpeningHours, OrganisationType } from '@/types/api'
import { PlaceListItem, type PlaceListItemProps } from '../PlaceListItem'

const embassy: OrganisationType = { id: 'type-1', type: 'embassy', slug: 'embassy', title: 'Embassy', color: null }
const office: OpeningHours = { mon: [['09:00', '13:00'], ['14:00', '18:00']] }

const render = (props: Partial<PlaceListItemProps> = {}) =>
  renderApp(<PlaceListItem place={organisation({ name: 'Russian Embassy' })} active={false} compact={false} onSelect={() => {}} {...props} />)

describe('PlaceListItem', () => {
  beforeEach(() => {
    // Monday 10:30 in Berlin.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-02T10:30:00+01:00'))
  })
  afterEach(() => vi.useRealTimers())

  it('shows the name, type, rating, city and the hours of today', () => {
    render({
      type: embassy,
      place: organisation({ name: 'Russian Embassy', city: 'Berlin', ratingAvg: 4.2, reviewsCount: 148, verified: true, openNow: true, openingHours: office, timezone: 'Europe/Berlin' }),
    })
    expect(screen.getByText('Russian Embassy')).toBeInTheDocument()
    expect(screen.getByText('Embassy')).toBeInTheDocument()
    expect(screen.getByText('4.2')).toBeInTheDocument()
    expect(screen.getByText('Berlin')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Verified' })).toBeInTheDocument()
    expect(screen.getByText('Open now')).toBeInTheDocument()
    expect(screen.getByText('· 09:00–13:00')).toBeInTheDocument()
  })

  it('names the next interval when closed for now, and says so when nothing is left today', () => {
    const { unmount } = render({ place: organisation({ openNow: false, openingHours: { mon: [['14:00', '18:00']] }, timezone: 'Europe/Berlin' }) })
    expect(screen.getByText('Closed')).toBeInTheDocument()
    expect(screen.getByText('· 14:00–18:00')).toBeInTheDocument()
    unmount()
    render({ place: organisation({ openNow: false, openingHours: { tue: [['09:00', '18:00']] }, timezone: 'Europe/Berlin' }) })
    expect(screen.getByText('· Closed today')).toBeInTheDocument()
  })

  it('shows no status for a place without hours, and no hours text when only openNow is known', () => {
    const { unmount } = render({ place: organisation({ openNow: null }) })
    expect(screen.queryByText('Open now')).not.toBeInTheDocument()
    expect(screen.queryByText('Closed')).not.toBeInTheDocument()
    unmount()
    render({ place: organisation({ openNow: true, openingHours: null }) })
    expect(screen.getByText('Open now')).toBeInTheDocument()
    expect(screen.queryByText(/·/)).not.toBeInTheDocument()
  })

  it('shows the distance up to 50 km and the city beyond (or without a distance)', () => {
    const { unmount } = render({ place: organisation({ city: 'Hamburg', distanceKm: 1.234 }) })
    expect(screen.getByText('1.2 km')).toBeInTheDocument()
    expect(screen.queryByText('Hamburg')).not.toBeInTheDocument()
    unmount()
    const far = render({ place: organisation({ city: 'Hamburg', distanceKm: 50 }) })
    expect(screen.getByText('Hamburg')).toBeInTheDocument()
    far.unmount()
    const none = render({ place: organisation({ city: null, distanceKm: undefined }) })
    expect(screen.queryByText(/km/)).not.toBeInTheDocument()
    none.unmount()
  })

  it('has no tag without a type, no verified mark for an unverified place', () => {
    render({ place: organisation({ verified: false, organisationTypeId: null }) })
    expect(screen.queryByText('Embassy')).not.toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'Verified' })).not.toBeInTheDocument()
  })

  it('colours the avatar by the type: the server colour, else the seeded type token, else the default', () => {
    const named = (name: string) => screen.getByRole('img', { name })
    const a = render({ place: organisation({ name: 'A' }), type: { ...embassy, color: '#123456' } })
    expect(named('A')).toHaveStyle({ backgroundColor: '#123456' })
    a.unmount()
    const b = render({ place: organisation({ name: 'B' }), type: embassy })
    expect(named('B')).toHaveStyle({ backgroundColor: '#4A6D8C' })
    b.unmount()
    const c = render({ place: organisation({ name: 'C' }), type: { id: 'x', type: 'other', slug: null, title: null, color: null } })
    expect(named('C')).not.toHaveAttribute('style')
    c.unmount()
    render({ place: organisation({ name: 'D' }) })
    expect(named('D')).not.toHaveAttribute('style')
  })

  it('hands the place to the caller when the row is clicked', async () => {
    const onSelect = vi.fn()
    const place = organisation({ name: 'Russian Embassy' })
    render({ place, onSelect })
    await userEvent.click(screen.getByRole('button', { name: /Russian Embassy/ }))
    expect(onSelect).toHaveBeenCalledWith(place)
  })

  it('marks the active row and brings it into view', () => {
    const { rerender } = render()
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()
    rerender(<PlaceListItem place={organisation({ name: 'Russian Embassy' })} active compact={false} onSelect={() => {}} />)
    expect(screen.getByRole('button', { name: /Russian Embassy/ })).toHaveAttribute('aria-pressed', 'true')
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })
  })

  it('offers a bookmark only when it can be saved, outside the row, without selecting the place', async () => {
    const onSelect = vi.fn()
    const onToggleSaved = vi.fn()
    const place = organisation({ name: 'Russian Embassy' })
    const { unmount } = render({ place })
    expect(screen.queryByRole('button', { name: /Save/ })).not.toBeInTheDocument()
    unmount()

    render({ place, onSelect, onToggleSaved, saved: false })
    const bookmark = screen.getByRole('button', { name: 'Save Russian Embassy' })
    expect(bookmark).toHaveAttribute('aria-pressed', 'false')
    // A button inside a button row is invalid: the bookmark is the row's sibling.
    expect(screen.getByRole('button', { name: /^Russian Embassy/ }).contains(bookmark)).toBe(false)
    await userEvent.click(bookmark)
    expect(onToggleSaved).toHaveBeenCalledWith(place)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('shows a saved place as pressed and offers to remove it', () => {
    render({ onToggleSaved: () => {}, saved: true })
    expect(screen.getByRole('button', { name: 'Remove Russian Embassy from saved' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('is tighter when compact', () => {
    render({ compact: true, place: organisation({ name: 'Compact' }) })
    expect(screen.getByRole('img', { name: 'Compact' })).toHaveClass('size-10')
  })
})
