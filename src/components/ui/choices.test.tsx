import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from './Checkbox'
import { Chip } from './Chip'
import { ChipGroup } from './ChipGroup'
import { ColorSwatches } from './ColorSwatches'
import { RadioGroup } from './RadioGroup'
import { Segmented } from './Segmented'
import { StarInput } from './StarInput'
import { Switch } from './Switch'

const LANGS = [
  { value: 'ru', label: 'Russian' },
  { value: 'en', label: 'English', icon: 'languages' as const },
]

describe('Chip', () => {
  it('reflects selection, org type and add variants', () => {
    const { rerender } = render(<Chip selected>Open now</Chip>)
    expect(screen.getByRole('button', { name: 'Open now' })).toHaveAttribute('aria-pressed', 'true')
    rerender(<Chip selected orgType="helper" size="sm">Helper</Chip>)
    expect(screen.getByRole('button')).toHaveClass('bg-type-helper-soft')
    rerender(<Chip add>New list</Chip>)
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed')
    rerender(<Chip icon="star">4.0+</Chip>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('ChipGroup', () => {
  it('toggles several values when multiple', async () => {
    const onChange = vi.fn()
    render(<ChipGroup multiple label="Languages" options={LANGS} defaultValue={['ru']} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'English' }))
    expect(onChange).toHaveBeenLastCalledWith(['ru', 'en'])
    await userEvent.click(screen.getByRole('button', { name: 'Russian' }))
    expect(onChange).toHaveBeenLastCalledWith(['en'])
    expect(screen.getByRole('button', { name: 'Russian' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('selects one value and offers an add chip', async () => {
    const onChange = vi.fn()
    const onAdd = vi.fn()
    render(<ChipGroup label="Cost" options={LANGS} value={null} onChange={onChange} onAdd={onAdd} scroll size="sm" />)
    await userEvent.click(screen.getByRole('button', { name: 'English' }))
    expect(onChange).toHaveBeenCalledWith('en')
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('works uncontrolled without callbacks, with a custom add label and a controlled array', async () => {
    const { rerender } = render(<ChipGroup label="Type" options={LANGS} defaultValue="ru" onAdd={() => {}} addLabel="More" />)
    await userEvent.click(screen.getByRole('button', { name: 'English' }))
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument()
    rerender(<ChipGroup multiple label="Langs" options={LANGS} value={['en']} />)
    await userEvent.click(screen.getByRole('button', { name: 'Russian' }))
    expect(screen.getByRole('button', { name: 'Russian' })).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('Segmented', () => {
  it('defaults to the first option and switches', async () => {
    const onChange = vi.fn()
    render(<Segmented label="Cost" options={[{ value: 'free', label: 'Free' }, { value: 'paid', label: 'Paid', count: 4, icon: 'star' }]} onChange={onChange} block size="sm" />)
    expect(screen.getByRole('radio', { name: 'Free' })).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(screen.getByRole('radio', { name: /Paid/ }))
    expect(onChange).toHaveBeenCalledWith('paid')
    expect(screen.getByRole('radio', { name: /Paid/ })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('honours defaultValue', () => {
    render(<Segmented label="Sort" options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} defaultValue="b" />)
    expect(screen.getByRole('radio', { name: 'B' })).toHaveAttribute('aria-checked', 'true')
  })
})

describe('Switch / Checkbox / RadioGroup', () => {
  it('Switch toggles and can be disabled', async () => {
    const onChange = vi.fn()
    const { rerender } = render(<Switch label="Monday" onChange={onChange} />)
    const sw = screen.getByRole('switch', { name: 'Monday' })
    await userEvent.click(sw)
    expect(sw).toHaveAttribute('aria-checked', 'true')
    expect(onChange).toHaveBeenCalledWith(true)
    rerender(<Switch label="Monday" disabled />)
    expect(sw).toBeDisabled()
  })

  it('Checkbox toggles with label and description', async () => {
    render(<Checkbox label="Daria agreed" description="Required" defaultChecked />)
    const box = screen.getByRole('checkbox', { name: /Daria agreed/ })
    expect(box).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(box)
    expect(box).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('RadioGroup picks one option', async () => {
    const onChange = vi.fn()
    render(<RadioGroup label="Reason" onChange={onChange} options={[{ value: 'closed', label: 'Closed permanently' }, { value: 'dup', label: 'Duplicate', description: 'Same place twice' }]} />)
    expect(screen.getAllByRole('radio').every((r) => r.getAttribute('aria-checked') === 'false')).toBe(true)
    await userEvent.click(screen.getByRole('radio', { name: /Duplicate/ }))
    expect(onChange).toHaveBeenCalledWith('dup')
    expect(screen.getByRole('radio', { name: /Duplicate/ })).toHaveAttribute('aria-checked', 'true')
  })
})

describe('ColorSwatches / StarInput', () => {
  it('ColorSwatches selects the first colour by default and changes', async () => {
    const onChange = vi.fn()
    render(<ColorSwatches label="Avatar colour" onChange={onChange} />)
    expect(screen.getByRole('radio', { name: '#4A6D8C' })).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(screen.getByRole('radio', { name: '#C7613F' }))
    expect(onChange).toHaveBeenCalledWith('#C7613F')
  })

  it('ColorSwatches accepts its own palette and default', () => {
    render(<ColorSwatches label="Colour" colors={['#111111', '#222222']} defaultValue="#222222" />)
    expect(screen.getByRole('radio', { name: '#222222' })).toHaveAttribute('aria-checked', 'true')
  })

  it('StarInput previews on hover and sets the rating', async () => {
    const onChange = vi.fn()
    const { container } = render(<StarInput label="Your rating" onChange={onChange} size="md" />)
    const four = screen.getByRole('radio', { name: '4 stars' })
    await userEvent.hover(four)
    expect(container.querySelectorAll('svg[fill="currentColor"]')).toHaveLength(4)
    await userEvent.unhover(screen.getByRole('radiogroup'))
    expect(container.querySelectorAll('svg[fill="currentColor"]')).toHaveLength(0)
    await userEvent.click(screen.getByRole('radio', { name: '1 star' }))
    expect(onChange).toHaveBeenCalledWith(1)
    expect(screen.getByRole('radio', { name: '1 star' })).toHaveAttribute('aria-checked', 'true')
  })

  it('StarInput shows a controlled value', () => {
    render(<StarInput label="Rating" value={5} />)
    expect(screen.getByRole('radio', { name: '5 stars' })).toHaveAttribute('aria-checked', 'true')
  })
})

describe('radiogroup keyboard pattern', () => {
  it('Segmented: one tab stop on the checked radio; arrows move and select, wrapping around', async () => {
    const onChange = vi.fn()
    render(<Segmented label="View" options={[{ value: 'map', label: 'Map' }, { value: 'list', label: 'List' }, { value: 'grid', label: 'Grid' }]} defaultValue="list" onChange={onChange} />)
    const [map, list, grid] = screen.getAllByRole('radio')
    expect([map.tabIndex, list.tabIndex, grid.tabIndex]).toEqual([-1, 0, -1])
    await userEvent.tab()
    expect(list).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    expect(grid).toHaveFocus()
    expect(onChange).toHaveBeenLastCalledWith('grid')
    await userEvent.keyboard('{ArrowRight}')
    expect(map).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(grid).toHaveFocus()
    await userEvent.keyboard('{Home}')
    expect(map).toHaveAttribute('aria-checked', 'true')
    await userEvent.keyboard('{End}')
    expect(grid).toHaveAttribute('aria-checked', 'true')
    await userEvent.keyboard('x')
    expect(grid).toHaveFocus()
  })

  it('Segmented renders nothing selected (no crash) while options are empty', () => {
    render(<Segmented label="Tabs" options={[]} />)
    expect(screen.getByRole('radiogroup', { name: 'Tabs' })).toBeEmptyDOMElement()
  })

  it('RadioGroup: first radio is the tab stop when none is checked; ArrowDown selects', async () => {
    const onChange = vi.fn()
    render(<RadioGroup label="Reason" options={[{ value: 'spam', label: 'Spam' }, { value: 'closed', label: 'Closed' }]} onChange={onChange} />)
    const [spam, closed] = screen.getAllByRole('radio')
    expect([spam.tabIndex, closed.tabIndex]).toEqual([0, -1])
    spam.focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(closed).toHaveFocus()
    expect(onChange).toHaveBeenCalledWith('closed')
    await userEvent.keyboard('{ArrowUp}')
    expect(onChange).toHaveBeenLastCalledWith('spam')
  })

  it('ColorSwatches: arrows select colours; swatches can carry readable names', async () => {
    const onChange = vi.fn()
    const names: Record<string, string> = { '#111111': 'Black', '#222222': 'Graphite' }
    render(<ColorSwatches label="Colour" colors={['#111111', '#222222']} colorLabel={(c) => names[c]} onChange={onChange} />)
    const black = screen.getByRole('radio', { name: 'Black' })
    expect(black.tabIndex).toBe(0)
    black.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'Graphite' })).toHaveFocus()
    expect(onChange).toHaveBeenCalledWith('#222222')
  })

  it('StarInput: arrows change the rating; the tab stop follows it', async () => {
    const onChange = vi.fn()
    render(<StarInput label="Rating" defaultValue={2} onChange={onChange} />)
    const stars = screen.getAllByRole('radio')
    expect(stars.map((s) => s.tabIndex)).toEqual([-1, 0, -1, -1, -1])
    stars[1].focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenCalledWith(3)
    expect(stars[2]).toHaveFocus()
  })

  it('ignores keys from elements that are not radios', () => {
    render(<Segmented label="View" options={[{ value: 'a', label: 'A' }]} />)
    const group = screen.getByRole('radiogroup')
    group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'true')
  })
})

describe('StarInput hover preview', () => {
  it('previews on mouse hover but not on a touch tap', () => {
    render(<StarInput label="Rating" value={0} />)
    const stars = screen.getAllByRole('radio')
    fireEvent.pointerEnter(stars[3], { pointerType: 'touch' })
    expect(stars[3].querySelector('svg')).toHaveAttribute('fill', 'none')
    fireEvent.pointerEnter(stars[3], { pointerType: 'mouse' })
    expect(stars[3].querySelector('svg')).toHaveAttribute('fill', 'currentColor')
    fireEvent.pointerLeave(screen.getByRole('radiogroup'))
    expect(stars[3].querySelector('svg')).toHaveAttribute('fill', 'none')
  })
})
