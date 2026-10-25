import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode } from 'react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { authUser } from '@/test/factories'
import { renderApp } from '@/test/render'
import { capture } from '@/test/server'
import GoogleCallbackPage from '../GoogleCallbackPage'

const open = (route: string) =>
  renderApp(
    <StrictMode>
      <Routes>
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
        <Route path="/map" element={<p>the map</p>} />
        <Route path="/signin" element={<p>sign-in page</p>} />
      </Routes>
    </StrictMode>,
    { route },
  )

describe('GoogleCallbackPage', () => {
  it('trades the single-use code for a session exactly once (even where effects run twice) and opens the map', async () => {
    const requests = capture('post', '/api/user/oauth/google/exchange', authUser({ token: 'google-jwt' }))
    open('/auth/google/callback?code=abc123')
    expect(screen.getByRole('status')).toHaveTextContent('Signing you in…')

    expect(await screen.findByText('the map')).toBeInTheDocument()
    expect(requests).toHaveLength(1)
    expect(requests[0].body).toEqual({ code: 'abc123' })
    expect(useAuthStore.getState().token).toBe('google-jwt')
  })

  it('explains a rejected code and offers the way back to sign-in', async () => {
    capture('post', '/api/user/oauth/google/exchange', { error: 'Invalid or expired code' }, 401)
    open('/auth/google/callback?code=spent')

    expect(await screen.findByText("Google sign-in didn't work")).toBeInTheDocument()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)

    await userEvent.click(screen.getByRole('button', { name: 'Back to sign in' }))
    expect(await screen.findByText('sign-in page')).toBeInTheDocument()
  })

  it('shows the failure without any request when the code is missing', async () => {
    open('/auth/google/callback')
    expect(await screen.findByText("Google sign-in didn't work")).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
  })
})
