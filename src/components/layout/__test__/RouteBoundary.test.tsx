import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { lazy, type ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { redirectTo } from '@/lib/navigation'
import { renderApp } from '@/test/render'
import { RouteBoundary } from '../RouteBoundary'

vi.mock('@/lib/navigation', () => ({ redirectTo: vi.fn() }))

beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}))

describe('RouteBoundary', () => {
  it('shows "Loading…" while a lazy page arrives, then the page', async () => {
    const Page = lazy(() => new Promise<{ default: () => ReactElement }>((resolve) => setTimeout(() => resolve({ default: () => <p>The page</p> }), 20)))
    renderApp(
      <RouteBoundary>
        <Page />
      </RouteBoundary>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Loading…')
    expect(await screen.findByText('The page')).toBeInTheDocument()
  })

  it('offers a reload instead of a white screen when a page chunk cannot be loaded', async () => {
    const Page = lazy(() => Promise.reject(new Error('Failed to fetch dynamically imported module')))
    renderApp(
      <RouteBoundary>
        <Page />
      </RouteBoundary>,
    )
    expect(await screen.findByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText("The page couldn't be loaded. Reload to try again.")).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Reload' }))
    expect(redirectTo).toHaveBeenCalledWith(window.location.href)
  })
})
