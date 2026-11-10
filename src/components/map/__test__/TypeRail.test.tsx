import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import type { OrganisationType } from '@/types/api'
import { TypeRail } from '../TypeRail'

const types: OrganisationType[] = [
  { id: '1', type: 'embassy', slug: 'embassy', title: 'Embassy', color: null },
  { id: '2', type: 'business', slug: 'business', title: 'Business', color: null },
  { id: '3', type: 'choir', slug: 'choir', title: null, color: '#123456' },
  { id: '4', type: 'unfilterable', slug: null, title: 'No slug', color: null },
]
const render = (value: string[], onChange = vi.fn()) => {
  renderApp(<TypeRail orgTypes={types} value={value} onChange={onChange} />)
  return onChange
}
const chip = (name: string) => screen.getByRole('button', { name })

describe('TypeRail', () => {
  it('lists All and every type that has a slug (the others cannot be filtered on)', () => {
    render([])
    expect(screen.getByRole('group', { name: 'Place types' })).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['All', 'Embassy', 'Business', 'choir'])
  })

  it('has All pressed when no type is chosen, else the chosen types', () => {
    const { unmount } = renderApp(<TypeRail orgTypes={types} value={[]} onChange={() => {}} />)
    expect(chip('All')).toHaveAttribute('aria-pressed', 'true')
    expect(chip('Embassy')).toHaveAttribute('aria-pressed', 'false')
    unmount()
    render(['embassy', 'business'])
    expect(chip('All')).toHaveAttribute('aria-pressed', 'false')
    expect(chip('Embassy')).toHaveAttribute('aria-pressed', 'true')
    expect(chip('Business')).toHaveAttribute('aria-pressed', 'true')
  })

  it('picking a type from All selects just that type', async () => {
    const onChange = render([])
    await userEvent.click(chip('Embassy'))
    expect(onChange).toHaveBeenLastCalledWith(['embassy'])
  })

  it('adds and removes types, and clears them with All', async () => {
    const onChange = render(['embassy'])
    await userEvent.click(chip('Business'))
    expect(onChange).toHaveBeenLastCalledWith(['embassy', 'business'])
    await userEvent.click(chip('Embassy'))
    expect(onChange).toHaveBeenLastCalledWith([])
    await userEvent.click(chip('All'))
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  it('keeps All when All is pressed again', async () => {
    const onChange = render([])
    await userEvent.click(chip('All'))
    expect(onChange).toHaveBeenLastCalledWith([])
  })
})
