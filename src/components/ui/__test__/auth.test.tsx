import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthLayout } from '../AuthLayout'
import { CorridorFields } from '../CorridorFields'
import { FormNote } from '../FormNote'
import { InlineStatus } from '../InlineStatus'
import { Logo } from '../Logo'
import { MapBackdrop } from '../MapBackdrop'
import { PageHeader } from '../PageHeader'
import { TopBar } from '../TopBar'
import { TypeBar } from '../TypeBar'

describe('Logo', () => {
  it('shows the wordmark, or hides it visually while keeping the name', () => {
    const { rerender, container } = render(<Logo />)
    expect(screen.getByText('landly')).not.toHaveClass('sr-only')
    rerender(<Logo variant="mark" size="sm" />)
    expect(screen.getByText('landly')).toHaveClass('sr-only')
    expect(container.querySelector('svg')).toHaveAttribute('width', '24')
  })

  it('is a link to its target only when given one', () => {
    const { rerender } = render(
      <MemoryRouter>
        <Logo />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    rerender(
      <MemoryRouter>
        <Logo to="/home" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'landly' })).toHaveAttribute('href', '/home')
  })
})

describe('MapBackdrop', () => {
  it('is a decorative, className-sized placeholder', () => {
    const { container } = render(<MapBackdrop className="h-80" />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.firstElementChild).toHaveClass('h-80', 'bg-country-water')
    expect(container.querySelector('svg, path')).toBeNull()
  })

  it('adds the readability fade only for the hero variant', () => {
    const { container, rerender } = render(<MapBackdrop />)
    expect(container.querySelector('.bg-linear-to-r')).toBeNull()
    rerender(<MapBackdrop variant="hero" />)
    expect(container.querySelector('.bg-linear-to-r')).not.toBeNull()
  })
})

describe('TypeBar', () => {
  const segments = [
    { slug: 'embassy', label: 'Embassy', count: 4 },
    { slug: 'business', label: 'Business', count: 12 },
    { slug: 'other', label: 'Other', count: 0 },
  ]

  it('lists every segment with its count and draws bars only for non-empty ones', () => {
    const { container } = render(<TypeBar label="Places by type" segments={segments} />)
    const legend = screen.getByRole('list', { name: 'Places by type' })
    expect(within(legend).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Embassy4', 'Business12', 'Other0'])
    const bars = container.querySelectorAll<HTMLElement>('div[aria-hidden] > span')
    expect([...bars].map((b) => b.style.flexGrow)).toEqual(['4', '12'])
  })

  it('draws no bars without places and colours unknown types neutral', () => {
    const { container } = render(<TypeBar label="Places" segments={[{ slug: 'other', label: 'Other', count: 0 }]} />)
    expect(container.querySelectorAll('div[aria-hidden] > span')).toHaveLength(0)
    expect(container.querySelector('li span[aria-hidden]')).toHaveClass('bg-ink-4')
  })
})

describe('TopBar', () => {
  it('shows the brand, actions and (from md) the navigation', () => {
    render(<TopBar brand={<b>brand</b>} nav={<nav>tabs</nav>} actions={<button>Sign in</button>} />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByText('brand')).toBeInTheDocument()
    expect(screen.getByText('tabs').parentElement).toHaveClass('hidden', 'md:block')
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('renders without navigation', () => {
    render(<TopBar brand="brand" />)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})

describe('CorridorFields', () => {
  it('puts both fields around the arrow, which is decorative', () => {
    const { container } = render(<CorridorFields from={<span>from</span>} to={<span>to</span>} />)
    expect(screen.getByText('from')).toBeInTheDocument()
    expect(screen.getByText('to')).toBeInTheDocument()
    expect(container.querySelector('[aria-hidden]')).toHaveClass('flex')
  })

  it('hides the arrow on phones when the fields are stacked', () => {
    const { container } = render(<CorridorFields stackOnPhone from="a" to="b" />)
    expect(container.querySelector('[aria-hidden]')).toHaveClass('hidden', 'md:flex')
  })
})

describe('AuthLayout', () => {
  it('renders the form in the main landmark and the hero copy in the aside', () => {
    render(
      <MemoryRouter>
        <AuthLayout aside={<PageHeader as="h2" title="Find your people" />} home="/start">
          <h1>Welcome back</h1>
        </AuthLayout>
      </MemoryRouter>,
    )
    expect(within(screen.getByRole('main')).getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'landly' }).every((a) => a.getAttribute('href') === '/start')).toBe(true)
    expect(screen.getByText('Find your people')).toBeInTheDocument()
  })

  it('works without hero copy', () => {
    render(
      <MemoryRouter>
        <AuthLayout>content</AuthLayout>
      </MemoryRouter>,
    )
    expect(screen.getByText('content')).toBeInTheDocument()
  })
})

describe('PageHeader hero size', () => {
  it('steps the display title up at md and lg', () => {
    render(<PageHeader size="hero" title="Landly" />)
    expect(screen.getByRole('heading', { name: 'Landly' })).toHaveClass('text-display-md', 'md:text-display-xl', 'lg:text-display-2xl')
  })
})

describe('FormNote', () => {
  it('centres a muted paragraph in two sizes', () => {
    const { rerender } = render(<FormNote>New to Landly?</FormNote>)
    expect(screen.getByText('New to Landly?')).toHaveClass('text-center', 'text-sm')
    rerender(<FormNote size="sm">or continue as guest</FormNote>)
    expect(screen.getByText('or continue as guest')).toHaveClass('text-label')
  })
})

describe('InlineStatus', () => {
  it('announces its message as a status next to a decorative spinner', () => {
    const { container } = render(<InlineStatus>Signing you in…</InlineStatus>)
    expect(screen.getByRole('status')).toHaveTextContent('Signing you in…')
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })
})
