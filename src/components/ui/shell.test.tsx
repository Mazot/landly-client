import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { MobileHeader } from './MobileHeader'
import { NavTabs } from './NavTabs'
import { Sheet } from './Sheet'
import { TabBar } from './TabBar'

describe('Sheet', () => {
  it('opens as a modal dialog labelled by its title and closes with the prop', () => {
    const { container, rerender } = render(
      <Sheet open onClose={() => {}} title="Filters" subtitle="Applies to the map" footer={<button>Show 21 places</button>} width="lg">
        Body
      </Sheet>,
    )
    const dialog = container.querySelector('dialog')!
    expect(dialog.open).toBe(true)
    expect(dialog).toHaveAccessibleName('Filters')
    expect(screen.getByText('Applies to the map')).toBeInTheDocument()
    expect(screen.getByText('Show 21 places')).toBeInTheDocument()
    rerender(<Sheet open={false} onClose={() => {}} title="Filters">Body</Sheet>)
    expect(dialog.open).toBe(false)
    rerender(<Sheet open={false} onClose={() => {}} title="Filters">Body</Sheet>)
    expect(dialog.open).toBe(false)
  })

  it('calls onClose for the close button, Esc and a backdrop click — not for clicks inside', async () => {
    const onClose = vi.fn()
    const { container } = render(<Sheet open onClose={onClose} title="Report">Inside</Sheet>)
    const dialog = container.querySelector('dialog')!
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }))
    fireEvent.click(dialog)
    fireEvent.click(screen.getByText('Inside'))
    expect(onClose).toHaveBeenCalledTimes(3)
  })
})

describe('MobileHeader', () => {
  it('shows title, subtitle, back button and trailing actions', async () => {
    const onBack = vi.fn()
    const { rerender } = render(<MobileHeader title="Photos" subtitle="6" back="back" onBack={onBack} trailing={<button>Upload</button>} />)
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(onBack).toHaveBeenCalledOnce()
    expect(screen.getByText('6')).toBeInTheDocument()
    rerender(<MobileHeader title="Add a place" back="close" />)
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    rerender(<MobileHeader title="Saved" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

const ITEMS = [
  { to: '/', label: 'Map', icon: 'pin' as const, end: true },
  { to: '/add', label: 'Add a place', icon: 'plus' as const, primary: true },
  { to: '/saved', label: 'Saved', icon: 'bookmark' as const },
]

describe('TabBar / NavTabs', () => {
  it('TabBar marks the current route and labels the primary button', () => {
    render(<MemoryRouter initialEntries={['/saved']}><TabBar label="Main" items={ITEMS} /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Saved' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Map' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Add a place' })).toHaveAttribute('href', '/add')
  })

  it('NavTabs shows labels, or icons with only the active label when compact', () => {
    const items = [{ to: '/', label: 'Map', icon: 'pin' as const, end: true }, { to: '/people', label: 'People', icon: 'users' as const }, { to: '/countries', label: 'Countries' }]
    const { rerender } = render(<MemoryRouter><NavTabs label="Main" items={items} /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Map' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('People')).toBeInTheDocument()
    rerender(<MemoryRouter><NavTabs label="Main" items={items} compact /></MemoryRouter>)
    expect(screen.queryByText('People')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'People' })).toBeInTheDocument()
    expect(screen.getByText('Map')).toBeInTheDocument()
  })

  it('NavTabs keeps icon-only links at least 44 px wide on touch screens', () => {
    const items = [{ to: '/', label: 'Map', icon: 'pin' as const, end: true }, { to: '/people', label: 'People', icon: 'users' as const }]
    render(<MemoryRouter><NavTabs label="Main" items={items} compact /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'People' })).toHaveClass('min-w-11', 'justify-center')
  })
})
