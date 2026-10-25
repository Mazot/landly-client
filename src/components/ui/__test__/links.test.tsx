import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { Divider } from '../Divider'
import { TextLink } from '../TextLink'

describe('TextLink', () => {
  it('renders a router link for `to`', () => {
    render(<MemoryRouter><TextLink to="/org/1" icon="arrowLeft" iconRight="chevronRight" size="md">Open</TextLink></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute('href', '/org/1')
  })

  it('renders an anchor for `href`', () => {
    render(<TextLink href="https://landly.app" tone="muted">Site</TextLink>)
    expect(screen.getByRole('link', { name: 'Site' })).toHaveAttribute('href', 'https://landly.app')
  })

  it('renders a button otherwise', async () => {
    const onClick = vi.fn()
    render(<TextLink tone="danger" onClick={onClick}>Decline</TextLink>)
    await userEvent.click(screen.getByRole('button', { name: 'Decline' }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})

describe('Divider', () => {
  it('is a plain rule without a label and a labelled separator with one', () => {
    const { container, rerender } = render(<Divider />)
    expect(container.querySelector('hr')).toBeInTheDocument()
    rerender(<Divider label="or with email" />)
    expect(screen.getByRole('separator')).toHaveTextContent('or with email')
  })
})
