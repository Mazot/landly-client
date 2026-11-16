import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { authUser } from '@/test/factories'
import { renderApp } from '@/test/render'
import { API, capture, server } from '@/test/server'
import type { ClaimPreview } from '@/types/api'
import ClaimPage from '../ClaimPage'

const preview = (over: Partial<ClaimPreview> = {}): ClaimPreview => ({
  id: 'p1',
  name: 'Daria Kuznetsova',
  status: 'awaiting',
  bio: 'Helps with flat-hunting.',
  city: 'Berlin',
  skills: ['Housing'],
  languageIds: ['l-de', 'l-unknown'],
  recommendedBy: { username: 'anna', name: 'Anna Morozova', avatarColor: null },
  email: null,
  whatsapp: '+49 157 4410 2290',
  telegram: '@daria_tg',
  instagram: null,
  showCity: true,
  showEmail: false,
  showWhatsapp: false,
  showTelegram: false,
  showInstagram: false,
  allowReviews: true,
  ...over,
})

function Probe() {
  const location = useLocation()
  return <output data-testid="path">{`${location.pathname}|${JSON.stringify(location.state)}`}</output>
}

const open = (token = 'tok') =>
  renderApp(
    <>
      <Routes>
        <Route path="/claim/:token" element={<ClaimPage />} />
        <Route path="/signin" element={<p>Sign in</p>} />
        <Route path="/people/:id" element={<p>The profile</p>} />
      </Routes>
      <Probe />
    </>,
    { route: `/claim/${token}` },
  )

beforeEach(() => capture('get', '/api/common/languages', [{ id: 'l-de', name: 'German', symbol: 'deu' }]))

describe('ClaimPage', () => {
  it('asks "Is this you?" with what was entered, the recommender and the privacy choices — nothing public yet', async () => {
    capture('get', '/api/person/claim/tok', preview())
    open()
    expect(await screen.findByRole('heading', { level: 1, name: 'Is this you, Daria?' })).toBeInTheDocument()
    expect(screen.getByText('Anna Morozova')).toBeInTheDocument()
    expect(screen.getByText('Daria Kuznetsova')).toBeInTheDocument()
    expect(screen.getByText('Helps with flat-hunting.')).toBeInTheDocument()
    // A language id the reference list does not know is left out.
    expect(within(await screen.findByRole('list', { name: 'Skills, city and languages' })).getAllByRole('listitem').map((item) => item.textContent)).toEqual(['Housing', 'Berlin', 'German'])

    expect(screen.getByRole('switch', { name: 'Show my WhatsApp' })).not.toBeChecked()
    expect(screen.getByText('+49 157 4410 2290')).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'Show my Telegram' })).not.toBeChecked()
    // What was not provided can't be shown.
    for (const name of ['Show my Instagram', 'Show my email']) expect(screen.getByRole('switch', { name })).toBeDisabled()
    expect(screen.getAllByText('Not provided')).toHaveLength(2)
    expect(screen.getByRole('switch', { name: 'Show my city' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'Allow reviews' })).toBeChecked()
  })

  it('has no recommender line, bio or tags when there is none', async () => {
    capture('get', '/api/person/claim/tok', preview({ recommendedBy: undefined, bio: null, skills: [], city: null, languageIds: [], whatsapp: null, telegram: null }))
    open()
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.queryByText(/recommended you as a helper/)).not.toBeInTheDocument()
    expect(screen.queryByText('How you help')).not.toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Skills, city and languages' })).not.toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'Show my city' })).toBeDisabled()
  })

  it('names the recommender by username when they have no name', async () => {
    capture('get', '/api/person/claim/tok', preview({ recommendedBy: { username: 'anna', name: null, avatarColor: '#abc' } }))
    open()
    expect(await screen.findByText('anna')).toBeInTheDocument()
  })

  it('confirms with the chosen toggles as a guest, then points to the public profile', async () => {
    capture('get', '/api/person/claim/tok', preview())
    const confirmed = capture('post', '/api/person/claim/tok/confirm', preview({ status: 'confirmed' }))
    open()
    await userEvent.click(await screen.findByRole('switch', { name: 'Show my WhatsApp' }))
    await userEvent.click(screen.getByRole('switch', { name: 'Show my city' }))
    await userEvent.click(screen.getByRole('switch', { name: 'Allow reviews' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirm my profile' }))

    expect(await screen.findByRole('heading', { name: 'Your profile is live' })).toBeInTheDocument()
    expect(confirmed[0].body).toEqual({ show_whatsapp: true, show_telegram: false, show_instagram: false, show_email: false, show_city: false, allow_reviews: false })
    expect(confirmed[0].headers.get('authorization')).toBeNull()
    expect(screen.getByText('People can find you under Helpers now, with the contacts you chose.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'View my profile' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/people/p1')
  })

  it('links the account when a signed-in visitor confirms', async () => {
    useAuthStore.getState().setAuth(authUser({ username: 'daria', token: 'my-jwt' }))
    capture('get', '/api/person/claim/tok', preview())
    const confirmed = capture('post', '/api/person/claim/tok/confirm', preview({ status: 'claimed' }))
    open()
    expect(await screen.findByText("You're signed in as @daria: confirming links this profile to your account.")).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sign in and link to my account' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Confirm my profile' }))
    expect(await screen.findByText(/and it is linked to your account/)).toBeInTheDocument()
    expect(confirmed[0].headers.get('authorization')).toBe('Bearer my-jwt')
  })

  it('sends a guest who wants to link an account to sign in, and back to this link', async () => {
    capture('get', '/api/person/claim/tok', preview())
    open()
    await userEvent.click(await screen.findByRole('button', { name: 'Sign in and link to my account' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/signin|{"from":{"pathname":"/claim/tok"}}')
  })

  it.each([
    [403, "You recommended this profile, so the person has to confirm it themselves."],
    [422, "Couldn't save your answer. The link may have been used or expired — try again."],
  ])('explains a refused confirmation (%i)', async (status, message) => {
    capture('get', '/api/person/claim/tok', preview())
    capture('post', '/api/person/claim/tok/confirm', { error: 'no' }, status)
    open()
    await userEvent.click(await screen.findByRole('button', { name: 'Confirm my profile' }))
    expect(await screen.findByText(message)).toBeInTheDocument()
  })

  it('declines after asking once more — and can change its mind', async () => {
    capture('get', '/api/person/claim/tok', preview())
    const declined = capture('post', '/api/person/claim/tok/decline', 'OK')
    open()
    await userEvent.click(await screen.findByRole('button', { name: "This isn't me / decline" }))
    expect(screen.getByText('Decline this recommendation? Nothing will be published.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByText('Decline this recommendation? Nothing will be published.')).not.toBeInTheDocument()
    expect(declined).toHaveLength(0)

    await userEvent.click(screen.getByRole('button', { name: "This isn't me / decline" }))
    await userEvent.click(screen.getByRole('button', { name: 'Yes, decline' }))
    expect(await screen.findByText('Got it — nothing was published')).toBeInTheDocument()
    expect(declined).toHaveLength(1)
  })

  it('says when declining did not go through', async () => {
    capture('get', '/api/person/claim/tok', preview())
    capture('post', '/api/person/claim/tok/decline', { error: 'used' }, 422)
    open()
    await userEvent.click(await screen.findByRole('button', { name: "This isn't me / decline" }))
    await userEvent.click(screen.getByRole('button', { name: 'Yes, decline' }))
    expect(await screen.findByText(/Couldn't save your answer/)).toBeInTheDocument()
  })

  it('waits for the preview', () => {
    server.use(http.get(`${API}/api/person/claim/tok`, () => new Promise(() => {})))
    open()
    expect(screen.getByText('Opening your link…')).toBeInTheDocument()
  })

  it('is not ready while a moderator is still reviewing, and has no form then', async () => {
    capture('get', '/api/person/claim/tok', preview({ status: 'pending' }))
    open()
    expect(await screen.findByText('Not ready yet')).toBeInTheDocument()
    expect(screen.getByText('A moderator is still reviewing the recommendation of Daria Kuznetsova. Open this link again soon.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Confirm my profile' })).not.toBeInTheDocument()
  })

  it('says an unknown link does not work, and a used or expired one was spent', async () => {
    capture('get', '/api/person/claim/tok', { error: 'Unknown claim token' }, 404)
    const { unmount } = open()
    expect(await screen.findByText("This link doesn't work")).toBeInTheDocument()
    unmount()
    capture('get', '/api/person/claim/tok', { error: 'Claim token already used' }, 422)
    open()
    expect(await screen.findByText('This link was already used or has expired')).toBeInTheDocument()
  })

  it('offers to try again when the link cannot be opened for another reason', async () => {
    let calls = 0
    server.use(http.get(`${API}/api/person/claim/tok`, () => (++calls === 1 ? HttpResponse.error() : HttpResponse.json(preview()))))
    open()
    await userEvent.click(await screen.findByRole('button', { name: 'Try again' }, { timeout: 5000 }))
    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Is this you, Daria?' })).toBeInTheDocument())
  })
})
