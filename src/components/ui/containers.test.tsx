import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { Callout } from './Callout'
import { Card } from './Card'
import { EmptyState } from './EmptyState'
import { KeyValueList } from './KeyValueList'
import { List } from './List'
import { ListItem } from './ListItem'
import { Menu } from './Menu'
import { Accent, PageHeader } from './PageHeader'
import { Section } from './Section'
import { Stat } from './Stat'
import { StepList } from './StepList'
import { ToggleRow } from './ToggleRow'

describe('Card', () => {
  it('renders variant, padding and element', () => {
    render(<Card variant="selected" padding="lg" interactive as="section">Body</Card>)
    const card = screen.getByText('Body')
    expect(card.tagName).toBe('SECTION')
    expect(card).toHaveClass('border-ink-1', 'p-5', 'cursor-pointer')
  })
})

describe('ListItem', () => {
  it('renders all slots', () => {
    render(<ListItem leading={<i>A</i>} title="Embassy" adornment={<b>✓</b>} subtitle="Berlin" meta={<span>4.6</span>} trailing={<span>›</span>} footer={<p>Note</p>} variant="card" size="sm" />)
    for (const text of ['A', 'Embassy', '✓', 'Berlin', '4.6', '›', 'Note']) expect(screen.getByText(text)).toBeInTheDocument()
  })

  it('is a router link, an anchor or a keyboard-operable button', async () => {
    const onClick = vi.fn()
    const { rerender } = render(<MemoryRouter><ListItem title="Org" to="/org/1" active /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Org' })).toHaveAttribute('aria-current', 'true')
    rerender(<MemoryRouter><ListItem title="Site" href="https://x.test" /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Site' })).not.toHaveAttribute('aria-current')
    rerender(<MemoryRouter><ListItem title="Site" href="https://x.test" active /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Site' })).toHaveAttribute('aria-current', 'true')
    rerender(<MemoryRouter><ListItem title="Org" to="/org/1" /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Org' })).not.toHaveAttribute('aria-current')
    rerender(<MemoryRouter><ListItem title="Queue item" onClick={onClick} variant="card" align="center" /></MemoryRouter>)
    const row = screen.getByRole('button', { name: 'Queue item' })
    await userEvent.click(row)
    row.focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await userEvent.keyboard('x')
    expect(onClick).toHaveBeenCalledTimes(3)
  })

  it('drops card styling inside a divided list', () => {
    render(
      <List variant="divided" label="Missions">
        <ListItem title="Embassy" variant="card" onClick={() => {}} />
      </List>,
    )
    expect(screen.getByRole('list', { name: 'Missions' })).toHaveClass('divide-y')
    expect(screen.getByRole('button', { name: 'Embassy' })).toHaveClass('px-4')
  })
})

describe('List / ToggleRow', () => {
  it('stacks rows with a gap', () => {
    const { container } = render(<List gap="sm"><div>a</div></List>)
    expect(container.firstChild).toHaveClass('gap-1')
    expect(container.firstChild).not.toHaveAttribute('role')
  })

  it('uses the medium gap by default and leaves unlabelled rows unwrapped', () => {
    const { container } = render(<List><div>a</div><div>b</div></List>)
    expect(container.firstChild).toHaveClass('gap-2')
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('exposes every row of a labelled list as a listitem (ARIA list needs owned items)', () => {
    render(
      <List label="Places">
        <ListItem title="Embassy" />
        {false}
        <ListItem title="Bakery" />
      </List>,
    )
    const items = within(screen.getByRole('list', { name: 'Places' })).getAllByRole('listitem')
    expect(items.map((li) => li.textContent)).toEqual(['Embassy', 'Bakery'])
  })

  it('ToggleRow labels its switch with the title', async () => {
    const onChange = vi.fn()
    render(<ToggleRow title="Show my WhatsApp" description="+49 157" onChange={onChange} />)
    await userEvent.click(screen.getByRole('switch', { name: 'Show my WhatsApp' }))
    expect(onChange).toHaveBeenCalledWith(true)
    expect(screen.getByText('+49 157')).toBeInTheDocument()
  })

  it('ToggleRow without description', () => {
    render(<ToggleRow title="Allow reviews" defaultChecked />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })
})

describe('Stat / KeyValueList / Section', () => {
  it('Stat renders value, label and icon', () => {
    const { container, rerender } = render(<Stat value="94%" label="still active" icon="check" variant="sunken" />)
    expect(screen.getByText('94%')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
    rerender(<Stat value={3} label="places" />)
    expect(container.firstChild).toHaveClass('shadow-1')
  })

  it('KeyValueList renders terms, mono values and works without a card', () => {
    const { container, rerender } = render(<KeyValueList items={[{ label: 'Currency', value: 'EUR' }, { label: 'Code', value: '+49', mono: true }]} />)
    expect(screen.getByText('+49')).toHaveClass('font-mono')
    expect(container.firstChild).toHaveClass('rounded-r3')
    rerender(<KeyValueList card={false} items={[{ label: 'Email', value: 'a@b.c' }]} />)
    expect(container.firstChild).not.toHaveClass('rounded-r3')
  })

  it('Section renders heading row only when needed', () => {
    const { rerender } = render(<Section title="Photos" subtitle="6 photos" action={<button>See all</button>} as="h2">x</Section>)
    expect(screen.getByRole('heading', { level: 2, name: 'Photos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'See all' })).toBeInTheDocument()
    rerender(<Section action={<button>Only action</button>}>x</Section>)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    rerender(<Section>plain</Section>)
    expect(screen.getByText('plain').querySelector('div')).toBeNull()
  })
})

describe('PageHeader / Callout', () => {
  it('PageHeader renders all parts with an accent word', () => {
    render(<PageHeader eyebrow="New" title={<>Add a <Accent>place</Accent></>} lede="Reviewed within a day" actions={<button>Submit</button>} back={<a href="/">Back</a>} size="xl" as="h2" />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Add a place')
    expect(screen.getByText('place').tagName).toBe('EM')
    for (const text of ['New', 'Reviewed within a day', 'Submit', 'Back']) expect(screen.getByText(text)).toBeInTheDocument()
  })

  it('PageHeader minimal', () => {
    render(<PageHeader title="Saved" size="sm" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Saved' })).toHaveClass('text-display-xs')
  })

  it('Callout: danger is an alert with the default icon; icon can be hidden', () => {
    const { container, rerender } = render(<Callout tone="danger">Invalid email or password</Callout>)
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password')
    expect(container.querySelector('svg')).toBeInTheDocument()
    rerender(<Callout tone="warning" size="lg" icon={false} title="Similar place nearby" actions={<button>Open existing</button>}>Kyiv Coffee</Callout>)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(container.querySelector('svg')).toBeNull()
    expect(screen.getByRole('button', { name: 'Open existing' })).toBeInTheDocument()
    rerender(<Callout tone="success" icon="check" title="No duplicates" />)
    expect(screen.getByText('No duplicates')).toBeInTheDocument()
    rerender(<Callout>Neutral</Callout>)
    expect(screen.getByText('Neutral')).toBeInTheDocument()
  })

  it('Callout draws danger/success icons bolder than the other tones', () => {
    const { container, rerender } = render(<Callout tone="success">Saved</Callout>)
    expect(container.querySelector('svg')).toHaveAttribute('stroke-width', '2.2')
    expect(container.querySelector('svg')).toHaveAttribute('width', '14')
    rerender(<Callout tone="info" size="lg">Moderators review new places</Callout>)
    expect(container.querySelector('svg')).toHaveAttribute('stroke-width', '1.8')
    expect(container.querySelector('svg')).toHaveAttribute('width', '16')
  })
})

describe('StepList / Menu / EmptyState', () => {
  it('StepList marks the current step and supports numbers', () => {
    const { rerender, container } = render(<StepList items={[{ title: 'Submitted', state: 'done', description: 'pending' }, { title: 'Review', state: 'current', icon: 'flag', trailing: <b>soon</b> }, { title: 'Live' }]} />)
    expect(screen.getByText('Review').closest('li')).toHaveAttribute('aria-current', 'step')
    expect(screen.getByText('soon')).toBeInTheDocument()
    rerender(<StepList numbered card={false} items={[{ title: 'One' }, { title: 'Two' }]} />)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(container.firstChild).not.toHaveClass('rounded-r3')
  })

  it('Menu runs actions and renders dividers', async () => {
    const onDelete = vi.fn()
    const { container } = render(<Menu label="Photo" items={[{ label: 'Set as primary', icon: 'star', onSelect: () => {} }, 'divider', { label: 'Delete photo', tone: 'danger', onSelect: onDelete }]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Delete photo' }))
    expect(onDelete).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Delete photo' })).toHaveClass('text-danger')
    expect(container.querySelector('hr')).toBeInTheDocument()
  })

  it('EmptyState renders code, action and the centred plain variant', () => {
    const { container, rerender } = render(<EmptyState icon="clock" tone="warning" code="429" title="Too many attempts" description="Wait a minute" action={<button>Retry</button>} />)
    for (const text of ['429', 'Too many attempts', 'Wait a minute', 'Retry']) expect(screen.getByText(text)).toBeInTheDocument()
    rerender(<EmptyState icon="check" title="Queue is clear" align="center" card={false} />)
    expect(container.firstChild).toHaveClass('text-center')
    expect(container.firstChild).not.toHaveClass('rounded-r3')
  })

  it('EmptyState narrows the description only when centred', () => {
    const { rerender } = render(<EmptyState icon="search" title="Nothing here" description="Try another filter" align="center" />)
    expect(screen.getByText('Try another filter')).toHaveClass('max-w-sm')
    rerender(<EmptyState icon="search" title="Nothing here" description="Try another filter" />)
    expect(screen.getByText('Try another filter')).not.toHaveClass('max-w-sm')
  })
})

describe('keys and fragments', () => {
  it('Menu renders actions that share a label without React key warnings', async () => {
    const error = vi.spyOn(console, 'error')
    const first = vi.fn()
    const second = vi.fn()
    render(<Menu label="Photos" items={[{ label: 'Delete', onSelect: first }, { label: 'Delete', onSelect: second }]} />)
    expect(error).not.toHaveBeenCalled()
    await userEvent.click(screen.getAllByRole('button', { name: 'Delete' })[1])
    expect(second).toHaveBeenCalledOnce()
    expect(first).not.toHaveBeenCalled()
  })

  it('a labelled List unwraps fragments, so every row is its own listitem', () => {
    render(
      <List label="Places">
        <>
          <ListItem title="Embassy" />
          <ListItem title="Bakery" />
          <ListItem title="Club" />
        </>
      </List>,
    )
    expect(within(screen.getByRole('list', { name: 'Places' })).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Embassy', 'Bakery', 'Club'])
  })
})
