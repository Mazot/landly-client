import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Avatar } from '../DS/Avatar'
import { Breadcrumbs } from '../DS/Breadcrumbs'
import { Card } from '../DS/Card'
import { Eyebrow } from '../DS/Eyebrow'
import { Heading } from '../DS/Heading'
import { PageHeader } from '../DS/PageHeader'
import { Section } from '../DS/Section'
import { Text } from '../DS/Text'

describe('Text', () => {
  it('is a body paragraph by default', () => {
    render(<Text>About</Text>)
    const text = screen.getByText('About')
    expect(text.tagName).toBe('P')
    expect(text).toHaveClass('m-0', 'text-sm', 'text-ink-2', 'font-medium', 'text-pretty')
    expect(text).not.toHaveClass('text-center', 'truncate')
  })

  it('takes element, size, tone, weight, alignment and truncation as props', () => {
    render(
      <Text as="span" size="xs" tone="faint" weight="bold" align="center" truncate className="px-4">
        2 days ago
      </Text>,
    )
    const text = screen.getByText('2 days ago')
    expect(text.tagName).toBe('SPAN')
    expect(text).toHaveClass('text-xs', 'text-ink-4', 'font-bold', 'text-center', 'truncate', 'px-4')
    expect(text).not.toHaveClass('text-pretty')
  })

  it.each([
    ['md', 'strong', 'semibold', 'text-md', 'text-ink-1', 'font-semibold'],
    ['label', 'muted', 'medium', 'text-label', 'text-ink-3', 'font-medium'],
    ['sm', 'danger', 'medium', 'text-sm', 'text-danger', 'font-medium'],
  ] as const)('%s / %s / %s', (size, tone, weight, ...classes) => {
    render(
      <Text size={size} tone={tone} weight={weight}>
        line
      </Text>,
    )
    expect(screen.getByText('line')).toHaveClass(...classes)
  })
})

describe('Heading / Eyebrow', () => {
  it('is a bold h2 of 17 px by default', () => {
    render(<Heading>Nearby</Heading>)
    expect(screen.getByRole('heading', { level: 2, name: 'Nearby' })).toHaveClass('m-0', 'text-lg', 'font-bold', 'text-ink-1')
  })

  it('has sm / lg sizes and a serif display figure that is not a heading', () => {
    const { rerender } = render(<Heading as="h3" size="sm">Add</Heading>)
    expect(screen.getByRole('heading', { level: 3 })).toHaveClass('text-sm')
    rerender(<Heading as="h1" size="lg" className="mt-1.5">24 places</Heading>)
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-2xl', 'mt-1.5')
    rerender(<Heading as="span" size="display">4.6</Heading>)
    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.getByText('4.6')).toHaveClass('font-display', 'text-display-lg', 'font-normal')
  })

  it('Section and PageHeader build on them', () => {
    render(
      <>
        <Section title="Languages" as="h2" size="sm">x</Section>
        <PageHeader eyebrow="New" title="Add a place" />
        <Eyebrow className="mb-1">Showing in this area</Eyebrow>
      </>,
    )
    expect(screen.getByRole('heading', { name: 'Languages' })).toHaveClass('text-sm', 'font-bold')
    expect(screen.getByText('New')).toHaveClass('uppercase', 'mb-2')
    expect(screen.getByText('New').tagName).toBe('DIV')
    const eyebrow = screen.getByText('Showing in this area')
    expect(eyebrow.tagName).toBe('P')
    expect(eyebrow).toHaveClass('uppercase', 'tracking-wider', 'text-ink-3', 'mb-1')
  })
})

describe('Breadcrumbs', () => {
  it('lists the trail, skips empty entries and marks the last one current', () => {
    render(<Breadcrumbs label="Breadcrumbs" items={[<a key="map" href="/map">Map</a>, undefined, '', 'Germany', 'Kyiv Coffee']} />)
    const nav = screen.getByRole('navigation', { name: 'Breadcrumbs' })
    expect(nav).toHaveClass('border-b', 'bg-surface')
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByRole('link', { name: 'Map' })).toBeInTheDocument()
    expect(screen.getByText('Germany')).not.toHaveAttribute('aria-current')
    expect(screen.getByText('Kyiv Coffee')).toHaveAttribute('aria-current', 'page')
    // A chevron between crumbs, none before the first.
    expect(nav.querySelectorAll('svg')).toHaveLength(2)
  })
})

describe('Card floating / aria-label / ref', () => {
  it('floats without a border and exposes its element', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Card ref={ref} as="section" variant="floating" padding="none" aria-label="Kyiv Coffee">
        Panel
      </Card>,
    )
    const card = screen.getByRole('region', { name: 'Kyiv Coffee' })
    expect(ref.current).toBe(card)
    expect(card).toHaveClass('rounded-r4', 'shadow-pop', 'bg-surface')
    expect(card).not.toHaveClass('border', 'rounded-r3')
  })

  it('keeps the hairline border on the other variants', () => {
    render(<Card variant="sunken">Box</Card>)
    expect(screen.getByText('Box')).toHaveClass('rounded-r3', 'border', 'border-border-1', 'bg-surface-2')
  })
})

describe('Avatar link', () => {
  it('is a round router link named by its hidden label and the name', () => {
    render(
      <MemoryRouter>
        <Avatar to="/account" linkLabel="Profile" name="Anna Morozova" className="ml-1" />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: 'Profile Anna Morozova' })
    expect(link).toHaveAttribute('href', '/account')
    expect(link).toHaveClass('size-11', 'rounded-full', 'ml-1')
    expect(screen.getByRole('img', { name: 'Anna Morozova' })).not.toHaveClass('ml-1')
  })

  it('works without a hidden label and as a square', () => {
    render(
      <MemoryRouter>
        <Avatar to="/org/1" name="Kyiv Coffee" square />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Kyiv Coffee' })).toHaveClass('rounded-r2')
  })
})
