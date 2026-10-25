import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { authUser } from '@/test/factories'
import { renderApp } from '@/test/render'
import { capture } from '@/test/server'
import SignInPage from '../SignInPage'

describe('SignInPage', () => {
  it('signs in and moves on to the map, replacing the sign-in page in history', async () => {
    capture('post', '/api/user/signin', authUser({ token: 'jwt-1' }))
    renderApp(
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/map" element={<p>the map</p>} />
      </Routes>,
      { route: '/signin' },
    )

    await userEvent.type(screen.getByLabelText('Email'), 'anna@mail.com')
    await userEvent.type(screen.getByLabelText('Password'), 'secret-pass')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('the map')).toBeInTheDocument()
    expect(useAuthStore.getState().token).toBe('jwt-1')
  })

  it('shows the hero copy next to the form', () => {
    renderApp(<SignInPage />, { route: '/signin' })
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Find your people in a new country.')
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { level: 1 }))
  })

  it('stays on the page after a failure', async () => {
    capture('post', '/api/user/signin', { error: 'Invalid email or password' }, 401)
    renderApp(<SignInPage />, { route: '/signin' })
    await userEvent.type(screen.getByLabelText('Email'), 'anna@mail.com')
    await userEvent.type(screen.getByLabelText('Password'), 'nope-nope')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
