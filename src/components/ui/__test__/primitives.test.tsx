import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { ICON_NAMES } from '../iconPaths'
import { IconButton } from '../IconButton'
import { Spinner } from '../Spinner'

describe('Icon', () => {
  it('is decorative without a label and an image with one', () => {
    const { container, rerender } = render(<Icon name="pin" />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    rerender(<Icon name="star" label="Rating" filled size={20} />)
    const svg = screen.getByRole('img', { name: 'Rating' })
    expect(svg).toHaveAttribute('fill', 'currentColor')
    expect(svg).toHaveAttribute('width', '20')
  })

  it('renders artwork for every name', () => {
    for (const name of ICON_NAMES) {
      const { container, unmount } = render(<Icon name={name} />)
      expect(container.querySelector('svg')!.childNodes.length, name).toBeGreaterThan(0)
      unmount()
    }
  })
})

describe('Spinner', () => {
  it('is announced only with a label', () => {
    const { rerender, container } = render(<Spinner />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
    rerender(<Spinner size="lg" label="Loading" />)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })
})

describe('Button', () => {
  it('fires onClick and defaults to type=button', async () => {
    const onClick = vi.fn()
    render(<Button variant="accent" icon="plus" iconRight="arrowRight" onClick={onClick}>Add</Button>)
    const btn = screen.getByRole('button', { name: 'Add' })
    expect(btn).toHaveAttribute('type', 'button')
    await userEvent.click(btn)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is busy and disabled while loading', async () => {
    const onClick = vi.fn()
    render(<Button size="lg" loading iconRight="arrowRight" onClick={onClick}>Save</Button>)
    const btn = screen.getByRole('button', { name: 'Save' })
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('aria-busy', 'true')
    await userEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  it.each(['sm', 'md'] as const)('renders an icon-only %s button with its aria-label', (size) => {
    render(<Button size={size} loading={size === 'md'} icon="link" aria-label="Copy link" block />)
    expect(screen.getByRole('button', { name: 'Copy link' })).toHaveClass('w-full')
  })
})

describe('IconButton', () => {
  it('uses the label as name and tooltip, and reflects pressed', async () => {
    const onClick = vi.fn()
    const { rerender } = render(<IconButton icon="bookmark" label="Save" onClick={onClick} />)
    const btn = screen.getByRole('button', { name: 'Save' })
    expect(btn).toHaveAttribute('title', 'Save')
    expect(btn).not.toHaveAttribute('aria-pressed')
    await userEvent.click(btn)
    expect(onClick).toHaveBeenCalledOnce()
    rerender(<IconButton icon="bookmark" label="Save" pressed variant="floating" size="lg" />)
    expect(btn).toHaveAttribute('aria-pressed', 'true')
  })
})

// Two border-colour utilities on one element resolve by CSS order, not class order
// (border-transparent used to win over border-border-2): exactly one per variant.
const borderColours = (el: HTMLElement) => [...el.classList].filter((c) => /^border-(transparent|border-|danger|ink-|accent|success)/.test(c))

describe('border colour of buttons', () => {
  it.each(['primary', 'accent', 'secondary', 'ghost', 'success', 'danger', 'whatsapp'] as const)('Button %s sets exactly one border colour', (variant) => {
    render(<Button variant={variant}>Go</Button>)
    expect(borderColours(screen.getByRole('button', { name: 'Go' }))).toHaveLength(1)
  })

  it('secondary and danger buttons keep a visible border', () => {
    render(<><Button variant="secondary">A</Button><Button variant="danger">B</Button></>)
    expect(screen.getByRole('button', { name: 'A' })).not.toHaveClass('border-transparent')
    expect(screen.getByRole('button', { name: 'B' })).not.toHaveClass('border-transparent')
  })

  it.each(['plain', 'outline', 'floating'] as const)('IconButton %s sets exactly one border colour', (variant) => {
    render(<IconButton icon="close" label="Close" variant={variant} />)
    expect(borderColours(screen.getByRole('button', { name: 'Close' }))).toHaveLength(1)
  })

  it('outline IconButton has a visible border', () => {
    render(<IconButton icon="close" label="Close" variant="outline" />)
    expect(screen.getByRole('button', { name: 'Close' })).toHaveClass('border-border-1')
    expect(screen.getByRole('button', { name: 'Close' })).not.toHaveClass('border-transparent')
  })
})
