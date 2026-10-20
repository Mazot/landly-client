import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Avatar } from './Avatar'
import { Badge } from './Badge'
import { CorridorFlags } from './CorridorFlags'
import { IconTile } from './IconTile'
import { ImageFrame } from './ImageFrame'
import { Meta } from './Meta'
import { OpenStatus } from './OpenStatus'
import { Rating } from './Rating'
import { Stars } from './Stars'
import { StatusBadge } from './StatusBadge'
import { Tag } from './Tag'
import { TypeTag } from './TypeTag'

describe('Avatar', () => {
  it('shows initials on the data colour', () => {
    render(<Avatar name="Anna Morozova" color="#C7613F" size="xl" />)
    const el = screen.getByRole('img', { name: 'Anna Morozova' })
    expect(el).toHaveTextContent('AM')
    expect(el).toHaveStyle({ backgroundColor: '#C7613F' })
  })

  it('falls back to the info token, custom initials and photos', () => {
    const { container, rerender } = render(<Avatar name="Kyiv Coffee" initials="KC" square />)
    expect(screen.getByRole('img')).toHaveClass('bg-info', 'rounded-r2')
    expect(screen.getByRole('img')).toHaveTextContent('KC')
    rerender(<Avatar name="Igor" src="/igor.jpg" />)
    expect(container.querySelector('img')).toHaveAttribute('src', '/igor.jpg')
  })
})

describe('Badge / StatusBadge', () => {
  it('renders tone, icon and size', () => {
    const { container } = render(<Badge tone="info" icon="verified" size="lg">Verified</Badge>)
    expect(screen.getByText('Verified')).toHaveClass('bg-info-soft', 'text-info', 'h-6.5')
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('scales its icon with the size (11 px default, 12 px large)', () => {
    const { container, rerender } = render(<Badge tone="success" icon="check">Open</Badge>)
    expect(container.querySelector('svg')).toHaveAttribute('width', '11')
    expect(screen.getByText('Open')).toHaveClass('h-5.5')
    rerender(<Badge tone="success" icon="check" size="lg">Open</Badge>)
    expect(container.querySelector('svg')).toHaveAttribute('width', '12')
  })

  it('translates API statuses and accepts a custom label', () => {
    const { rerender } = render(<StatusBadge status="pending" />)
    expect(screen.getByText('Pending review')).toHaveClass('bg-warning-soft')
    rerender(<StatusBadge status="awaiting" label="Awaiting" />)
    expect(screen.getByText('Awaiting')).toHaveClass('bg-info-soft')
  })
})

describe('Tag', () => {
  it('renders dot and icon, and a remove button when removable', async () => {
    const onRemove = vi.fn()
    const { container, rerender } = render(<Tag orgType="embassy" icon="pin">Consulate · Hamburg</Tag>)
    expect(container.querySelector('.bg-type-embassy')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    rerender(<Tag onRemove={onRemove}>Russian</Tag>)
    await userEvent.click(screen.getByRole('button', { name: 'Remove Russian' }))
    expect(onRemove).toHaveBeenCalledOnce()
    rerender(<Tag size="md">Housing</Tag>)
    expect(screen.getByText('Housing')).toHaveClass('h-8')
  })
})

describe('TypeTag', () => {
  it('uses the type tokens for seeded slugs', () => {
    render(<TypeTag slug="helper" label="Helper" />)
    expect(screen.getByText('Helper')).toHaveClass('bg-type-helper-soft', 'text-type-helper')
  })

  it('applies the server colour for custom types', () => {
    const { container } = render(<TypeTag slug="other" label="Club" color="#123456" />)
    expect(screen.getByText('Club')).toHaveStyle({ color: '#123456' })
    expect(container.querySelector('span span')).toHaveStyle({ backgroundColor: '#123456' })
  })

  it('falls back to neutral without slug or colour, and supports outline without dot', () => {
    const { container, rerender } = render(<TypeTag slug={null} label="Unknown" />)
    expect(screen.getByText('Unknown')).toHaveClass('bg-surface-2')
    rerender(<TypeTag slug="other" label="Club" color="#123456" variant="outline" dot={false} />)
    expect(screen.getByText('Club')).toHaveClass('bg-surface')
    expect(screen.getByText('Club')).not.toHaveStyle({ color: '#123456' })
    expect(container.querySelector('span span')).toBeNull()
  })
})

describe('IconTile', () => {
  it('renders an icon or custom content', () => {
    const { container, rerender } = render(<IconTile icon="upload" tone="accent" size="xl" shape="circle" />)
    expect(container.firstChild).toHaveClass('bg-accent-tint', 'rounded-full', 'size-15')
    expect(container.querySelector('svg')).toBeInTheDocument()
    rerender(<IconTile tone="surface">🇩🇪</IconTile>)
    expect(container.firstChild).toHaveTextContent('🇩🇪')
    expect(container.firstChild).not.toHaveAttribute('aria-hidden')
  })
})

describe('Stars / Rating', () => {
  it('fills stars up to the rounded value', () => {
    const { container } = render(<Stars value={3.6} />)
    expect(screen.getByRole('img', { name: '3.6 out of 5' })).toBeInTheDocument()
    expect(container.querySelectorAll('svg[fill="currentColor"]')).toHaveLength(4)
  })

  it('shows average and count, or an empty label', () => {
    const { rerender } = render(<Rating value={4.6} count={148} />)
    expect(screen.getByText('4.6')).toBeInTheDocument()
    expect(screen.getByText('· 148')).toBeInTheDocument()
    rerender(<Rating value={4.8} count={3} size="sm" />)
    expect(screen.getByText('4.8').parentElement).toHaveClass('text-xs')
    rerender(<Rating value={null} count={0} />)
    expect(screen.getByText('No reviews yet')).toBeInTheDocument()
    rerender(<Rating value={4} count={0} size="sm" />)
    expect(screen.getByText('No reviews yet')).toHaveClass('text-xs')
  })
})

describe('OpenStatus', () => {
  it('renders open, closed and nothing for unknown hours', () => {
    const { container, rerender } = render(<OpenStatus open hours="until 18:00" />)
    expect(screen.getByText('Open now').parentElement).toHaveClass('text-success')
    expect(screen.getByText('· until 18:00')).toBeInTheDocument()
    rerender(<OpenStatus open={false} size="sm" />)
    expect(screen.getByText('Closed').parentElement).toHaveClass('text-ink-3', 'text-xs')
    rerender(<OpenStatus open={null} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('Meta / CorridorFlags / ImageFrame', () => {
  it('Meta renders icon and strong style', () => {
    const { container } = render(<Meta icon="eye" strong>2,481 visits</Meta>)
    expect(screen.getByText('2,481 visits')).toHaveClass('text-ink-2')
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('Meta defaults to muted text without an icon', () => {
    const { container } = render(<Meta>2 days ago</Meta>)
    expect(screen.getByText('2 days ago')).toHaveClass('text-ink-3', 'font-medium')
    expect(screen.getByText('2 days ago')).not.toHaveClass('text-ink-2')
    expect(container.querySelector('svg')).toBeNull()
  })

  it('CorridorFlags exposes the corridor name', () => {
    const { rerender } = render(<CorridorFlags from="🇷🇺" to="🇩🇪" label="Russia → Germany">Germany</CorridorFlags>)
    expect(screen.getByRole('img', { name: 'Russia → Germany' })).toBeInTheDocument()
    expect(screen.getByText('Germany')).toBeInTheDocument()
    rerender(<CorridorFlags from="🇷🇺" to="🇷🇸" label="Russia → Serbia" size="lg" />)
    expect(screen.getByRole('img', { name: 'Russia → Serbia' })).toHaveClass('text-2xl')
  })

  it('ImageFrame shows the photo or a placeholder, with overlays', () => {
    const { container, rerender } = render(<ImageFrame src="/a.jpg" alt="Front door" badge={<b>Primary</b>} action={<i>menu</i>} ratio="square" rounded={false} />)
    expect(screen.getByRole('img', { name: 'Front door' })).toHaveAttribute('loading', 'lazy')
    expect(screen.getByText('Primary')).toBeInTheDocument()
    expect(screen.getByText('menu')).toBeInTheDocument()
    rerender(<ImageFrame alt="" />)
    expect(container.querySelector('img')).toBeNull()
    expect(container.firstChild).toHaveClass('aspect-4/3', 'rounded-r3')
  })
})

describe('accessible names of ratings and avatars', () => {
  it('Stars announces the rating rounded to one decimal, like Rating shows it', () => {
    render(<Stars value={4.666666} />)
    expect(screen.getByRole('img')).toHaveAccessibleName('4.7 out of 5')
  })

  it('Avatar shows "?" instead of an empty circle for a blank name, and skips emoji', () => {
    const { rerender } = render(<Avatar name="   " />)
    expect(screen.getByRole('img')).toHaveTextContent('?')
    rerender(<Avatar name="🇩🇪 Club" />)
    expect(screen.getByRole('img')).toHaveTextContent('C')
  })
})
