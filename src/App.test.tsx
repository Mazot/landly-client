import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the (empty) route shell on any path without crashing', () => {
    for (const path of ['/', '/auth/google/callback', '/claim/token']) {
      const { container, unmount } = render(
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>,
      )
      expect(container.innerHTML).toBe('')
      unmount()
    }
  })
})
