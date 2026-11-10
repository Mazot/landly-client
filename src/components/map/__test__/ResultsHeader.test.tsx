import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { ResultsHeader, type ResultsHeaderProps } from '../ResultsHeader'

const render = (props: Partial<ResultsHeaderProps> = {}) => {
  const onSortChange = vi.fn()
  renderApp(<ResultsHeader size="desktop" count={48} capped={false} sort="nearest" onSortChange={onSortChange} {...props} />)
  return onSortChange
}

describe('ResultsHeader', () => {
  it('desktop: "Showing in this area", the count and the sort chips', async () => {
    const onSortChange = render()
    expect(screen.getByText('Showing in this area')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: '48 organizations' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nearest' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Recently added' }))
    expect(onSortChange).toHaveBeenCalledWith('recent')
    await userEvent.click(screen.getByRole('button', { name: 'Verified first' }))
    expect(onSortChange).toHaveBeenLastCalledWith('verified')
  })

  it('tablet: the count and the chips on one row', () => {
    render({ size: 'tablet' })
    expect(screen.getByRole('heading', { level: 2, name: '48 organizations' })).toBeInTheDocument()
    expect(screen.queryByText('Showing in this area')).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Sort by' })).toBeInTheDocument()
  })

  it('phone: "48 nearby" and a select for the order', async () => {
    const onSortChange = render({ size: 'phone' })
    expect(screen.getByText('48 nearby')).toBeInTheDocument()
    const select = screen.getByRole('combobox', { name: 'Sort by' })
    expect(select).toHaveValue('nearest')
    await userEvent.selectOptions(select, 'verified')
    expect(onSortChange).toHaveBeenCalledWith('verified')
  })

  it('uses the singular for one place', () => {
    render({ count: 1 })
    expect(screen.getByRole('heading', { name: '1 organization' })).toBeInTheDocument()
  })

  it('adds a plus when more places lie beyond the page', () => {
    render({ count: 100, capped: true })
    expect(screen.getByRole('heading', { name: '100+ organizations' })).toBeInTheDocument()
  })

  it('says it is loading until the first search is done, on every size', () => {
    const { unmount } = renderApp(<ResultsHeader size="desktop" count={null} capped={false} sort="nearest" onSortChange={() => {}} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Loading organizations…')
    unmount()
    const phone = renderApp(<ResultsHeader size="phone" count={null} capped={false} sort="nearest" onSortChange={() => {}} />)
    expect(screen.getByText('Loading organizations…')).toBeInTheDocument()
    phone.unmount()
  })
})
