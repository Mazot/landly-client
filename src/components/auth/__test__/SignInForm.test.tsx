import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { redirectTo } from '@/lib/navigation'
import { GOOGLE_LOGIN_URL } from '@/services/user.service'
import { useAuthStore } from '@/stores/authStore'
import { authUser } from '@/test/factories'
import { renderApp } from '@/test/render'
import { API, capture, server } from '@/test/server'
import { SignInForm } from '../SignInForm'

vi.mock('@/lib/navigation')

async function fill(email: string, password: string) {
  const user = userEvent.setup()
  if (email) await user.type(screen.getByLabelText('Email'), email)
  if (password) await user.type(screen.getByLabelText('Password'), password)
  await user.click(screen.getByRole('button', { name: 'Sign in' }))
}

describe('SignInForm', () => {
  it('signs in with the trimmed email and starts the session', async () => {
    const onSuccess = vi.fn()
    const requests = capture('post', '/api/user/signin', authUser({ token: 'fresh-jwt' }))
    renderApp(<SignInForm onSuccess={onSuccess} />)

    await fill('  Anna@Mail.com ', 'secret-pass')

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce())
    expect(requests[0].body).toEqual({ email: 'Anna@Mail.com', password: 'secret-pass' })
    expect(useAuthStore.getState()).toMatchObject({ isAuthenticated: true, token: 'fresh-jwt' })
  })

  it('asks for both fields and sends nothing', async () => {
    const onSuccess = vi.fn()
    renderApp(<SignInForm onSuccess={onSuccess} />)

    await fill('', '')

    expect(await screen.findByText('Enter your email')).toBeInTheDocument()
    expect(screen.getByText('Enter your password')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInvalid()
    expect(onSuccess).not.toHaveBeenCalled()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('rejects a malformed email before asking the server', async () => {
    renderApp(<SignInForm onSuccess={vi.fn()} />)
    await fill('not-an-email', 'secret-pass')
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument()
  })

  it('shows one message for a wrong password and marks both fields, without naming either', async () => {
    capture('post', '/api/user/signin', { error: 'Invalid email or password' }, 401)
    const onSuccess = vi.fn()
    renderApp(<SignInForm onSuccess={onSuccess} />)

    await fill('anna@mail.com', 'wrong-pass')

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password')
    expect(screen.getByLabelText('Email')).toBeInvalid()
    expect(screen.getByLabelText('Password')).toBeInvalid()
    expect(onSuccess).not.toHaveBeenCalled()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('clears the previous error while the next attempt is in flight', async () => {
    let attempts = 0
    server.use(http.post(`${API}/api/user/signin`, () => (++attempts === 1 ? HttpResponse.json({ error: 'x' }, { status: 401 }) : HttpResponse.json(authUser()))))
    const onSuccess = vi.fn()
    renderApp(<SignInForm onSuccess={onSuccess} />)

    await fill('anna@mail.com', 'wrong-pass')
    await screen.findByRole('alert')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it.each([
    ['rate limiting', () => capture('post', '/api/user/signin', 'Too many requests', 429), 'Too many attempts — try again in a minute.'],
    ['a server error', () => capture('post', '/api/user/signin', 'boom', 500), 'Something went wrong. Please try again.'],
    ['no connection', () => server.use(http.post(`${API}/api/user/signin`, () => HttpResponse.error())), "Can't reach Landly. Check your connection and try again."],
  ])('explains %s', async (_, arrange, message) => {
    arrange()
    renderApp(<SignInForm onSuccess={vi.fn()} />)

    await fill('anna@mail.com', 'secret-pass')

    expect(await screen.findByRole('alert')).toHaveTextContent(message)
    expect(screen.getByLabelText('Email')).not.toBeInvalid()
  })

  it('starts Google sign-in as a top-level navigation', async () => {
    renderApp(<SignInForm onSuccess={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Continue with Google' }))
    expect(redirectTo).toHaveBeenCalledWith(GOOGLE_LOGIN_URL)
  })

  it('links to sign-up and to guest browsing', () => {
    renderApp(<SignInForm onSuccess={vi.fn()} />)
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute('href', '/signup')
    expect(screen.getByRole('link', { name: 'continue as guest' })).toHaveAttribute('href', '/')
  })
})
