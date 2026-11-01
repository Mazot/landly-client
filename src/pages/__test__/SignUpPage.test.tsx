import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { HttpResponse, delay, http } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { useCorridorStore } from '@/stores/corridorStore'
import { authUser, country } from '@/test/factories'
import { renderApp } from '@/test/render'
import { API, capture, server } from '@/test/server'
import SignUpPage from '../SignUpPage'

const russia = country({ name: 'Russia' })
const germany = country({ name: 'Germany' })

function open() {
  capture('get', '/api/common/countries', [russia, germany])
  return renderApp(
    <Routes>
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/map" element={<p>the map</p>} />
    </Routes>,
    { route: '/signup' },
  )
}

async function stepOne(username = 'anna.m') {
  const user = userEvent.setup()
  await user.clear(screen.getByLabelText('Username'))
  await user.type(screen.getByLabelText('Username'), username)
  await user.clear(screen.getByLabelText('Email'))
  await user.type(screen.getByLabelText('Email'), 'anna@mail.com')
  await user.clear(screen.getByLabelText('Password'))
  await user.type(screen.getByLabelText('Password'), 'password123')
  await user.click(screen.getByRole('button', { name: /Continue/ }))
}

describe('SignUpPage', () => {
  afterEach(() => useCorridorStore.setState({ fromId: null, toId: null }))

  it('creates the account and the default corridor in one request, then opens the map', async () => {
    const requests = capture('post', '/api/user/signup', authUser({ token: 'new-jwt' }))
    open()
    await stepOne()
    expect(await screen.findByRole('heading', { name: 'Where are you headed?' })).toBeInTheDocument()
    expect(requests).toHaveLength(0)
    await waitFor(() => expect(screen.getByLabelText('From')).toHaveValue(russia.id))

    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByText('the map')).toBeInTheDocument()
    expect(requests).toHaveLength(1)
    expect(requests[0].body).toMatchObject({
      username: 'anna.m',
      email: 'anna@mail.com',
      password: 'password123',
      locale: 'en',
      here_as: 'newcomer',
      home_country_id: russia.id,
      corridor_from_country_id: russia.id,
      corridor_to_country_id: germany.id,
    })
    expect(useAuthStore.getState().token).toBe('new-jwt')
  })

  it('"Skip for now" creates just the account', async () => {
    const requests = capture('post', '/api/user/signup', authUser())
    open()
    await stepOne()

    await userEvent.click(await screen.findByRole('button', { name: 'Skip for now' }))

    expect(await screen.findByText('the map')).toBeInTheDocument()
    expect(requests[0].body).toEqual({ username: 'anna.m', email: 'anna@mail.com', password: 'password123', locale: 'en' })
  })

  it('goes back to step 1 with the entered account intact', async () => {
    open()
    await stepOne()
    await userEvent.click(await screen.findByRole('button', { name: 'Back' }))

    expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toHaveValue('anna.m')
    expect(screen.getByLabelText('Email')).toHaveValue('anna@mail.com')
  })

  it('returns to step 1 when the server says the username is taken, and clears the notice on edit', async () => {
    capture('post', '/api/user/signup', { error: 'Unique constraint violated', constraint: 'users_username_key' }, 422)
    open()
    await stepOne('taken')
    await userEvent.click(await screen.findByRole('button', { name: 'Create account' }))

    expect(await screen.findByText('This username is taken')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toHaveValue('taken')
    expect(useAuthStore.getState().isAuthenticated).toBe(false)

    await userEvent.type(screen.getByLabelText('Username'), '2')
    expect(screen.queryByText('This username is taken')).not.toBeInTheDocument()
  })

  it('keeps what was typed on step 2 (and the corridor draft) through a taken-username round trip', async () => {
    const ukraine = country({ name: 'Ukraine' })
    capture('get', '/api/common/countries', [russia, germany, ukraine])
    let attempts = 0
    server.use(
      http.post(`${API}/api/user/signup`, async ({ request }) => {
        attempts++
        const body = (await request.json()) as { username: string }
        return body.username === 'taken'
          ? HttpResponse.json({ error: 'Unique constraint violated', constraint: 'users_username_key' }, { status: 422 })
          : HttpResponse.json(authUser({ token: 'new-jwt' }))
      }),
    )
    const sent: unknown[] = []
    server.events.on('request:start', async ({ request }) => {
      if (request.url.endsWith('/api/user/signup')) sent.push(await request.clone().json())
    })
    renderApp(
      <Routes>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/map" element={<p>the map</p>} />
      </Routes>,
      { route: '/signup' },
    )
    const user = userEvent.setup()
    await stepOne('taken')
    await screen.findByRole('heading', { name: 'Where are you headed?' })
    await waitFor(() => expect(screen.getByLabelText('To')).toBeEnabled())
    await user.selectOptions(screen.getByLabelText('To'), ukraine.id)
    await user.type(screen.getByLabelText(/Your name/), 'Anna')
    await user.click(screen.getByRole('button', { name: 'Helping others' }))
    await user.click(screen.getByRole('radio', { name: 'Plum' }))
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('This username is taken')).toBeInTheDocument()

    await stepOne('anna.m')

    expect(await screen.findByRole('heading', { name: 'Where are you headed?' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Your name/)).toHaveValue('Anna')
    expect(screen.getByLabelText('To')).toHaveValue(ukraine.id)
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('the map')).toBeInTheDocument()
    expect(attempts).toBe(2)
    expect(sent[1]).toMatchObject({ username: 'anna.m', name: 'Anna', here_as: 'helping', avatar_color: '#8B5A8C', corridor_to_country_id: ukraine.id })
    server.events.removeAllListeners()
  })

  it('ignores "Back" while the account is being created, so a second account cannot be started', async () => {
    let attempts = 0
    server.use(
      http.post(`${API}/api/user/signup`, async () => {
        attempts++
        await delay(150)
        return HttpResponse.json(authUser({ token: 'only-jwt' }))
      }),
    )
    open()
    await stepOne()
    await userEvent.click(await screen.findByRole('button', { name: 'Create account' }))

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('heading', { name: 'Where are you headed?' })).toBeInTheDocument()

    expect(await screen.findByText('the map')).toBeInTheDocument()
    expect(attempts).toBe(1)
    expect(useAuthStore.getState().token).toBe('only-jwt')
  })

  it('returns to step 1 when the email is taken', async () => {
    capture('post', '/api/user/signup', { error: 'Unique constraint violated', constraint: 'users_email_lower_key' }, 422)
    open()
    await stepOne()
    await userEvent.click(await screen.findByRole('button', { name: 'Skip for now' }))
    expect(await screen.findByText('An account with this email already exists')).toBeInTheDocument()
  })

  it('stays on step 2 with a message for other failures, which disappears when going back', async () => {
    capture('post', '/api/user/signup', 'boom', 500)
    open()
    await stepOne()
    await userEvent.click(await screen.findByRole('button', { name: 'Create account' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong')
    expect(screen.getByRole('heading', { name: 'Where are you headed?' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    await userEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByRole('heading', { name: 'Where are you headed?' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
