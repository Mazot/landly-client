import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { authUser, corridor, country, list, userProfile } from '@/test/factories'
import { renderApp } from '@/test/render'
import { capture } from '@/test/server'
import { setViewportWidth } from '@/test/viewport'
import { AppShell } from '../AppShell'
import { useAppShell } from '../appShellContext'

const russia = country({ name: 'Russia', flag: '🇷🇺' })
const germany = country({ name: 'Germany', flag: '🇩🇪' })

function Page() {
  const { openCorridors } = useAppShell()
  return <button onClick={openCorridors}>open the picker</button>
}

/** A guest by default; `signedIn` adds a profile and a saved corridor. */
function open({ signedIn = false } = {}) {
  capture('get', '/api/common/countries', [russia, germany])
  capture('get', '/api/common/org_types', [])
  if (signedIn) {
    useAuthStore.getState().setAuth(authUser({ username: 'alina' }))
    capture('get', '/api/user/me', userProfile({ name: 'Alina Morozova', avatarColor: '#123456' }))
    capture('get', '/api/corridor/list', list([corridor({ fromCountryId: russia.id, toCountryId: germany.id, isDefault: true })]))
  }
  return renderApp(
    <AppShell>
      <Page />
    </AppShell>,
  )
}

describe('AppShell · desktop', () => {
  it('guest: logo, the corridor pill, the sections, language, sign in and sign up', async () => {
    open()
    expect(screen.getByRole('link', { name: 'landly' })).toHaveAttribute('href', '/map')
    expect(await screen.findByRole('button', { name: /Germany/ })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getAllByRole('link').map((a) => a.textContent)).toEqual(['Map', 'People', 'Countries', 'Saved'])
    expect(screen.getByLabelText('Language')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/signin')
    expect(screen.getByRole('link', { name: 'Create account' })).toHaveAttribute('href', '/signup')
    expect(screen.queryByRole('link', { name: 'Profile' })).not.toBeInTheDocument()
  })

  it('signed in: add a place and the avatar of the profile instead of the sign-in buttons', async () => {
    open({ signedIn: true })
    expect(await screen.findByRole('link', { name: 'Add' })).toHaveAttribute('href', '/add')
    const profile = screen.getByRole('link', { name: 'Profile' })
    expect(profile).toHaveAttribute('href', '/account')
    await waitFor(() => expect(within(profile).getByRole('img', { name: 'Alina Morozova' })).toHaveStyle({ backgroundColor: '#123456' }))
    expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument()
  })

  it('names the avatar after the username until the profile arrives', async () => {
    open({ signedIn: true })
    expect(await within(await screen.findByRole('link', { name: 'Profile' })).findByRole('img')).toHaveAccessibleName(/alina|Alina/)
  })

  it('opens the corridor picker from the pill — a guest chooses a pair', async () => {
    open()
    await userEvent.click(await screen.findByRole('button', { name: /Germany/ }))
    expect(screen.getByRole('dialog', { name: 'Choose your corridor' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the same picker for the screen inside — a signed-in user sees their corridors', async () => {
    open({ signedIn: true })
    await userEvent.click(screen.getByRole('button', { name: 'open the picker' }))
    expect(screen.getByRole('dialog', { name: 'Your corridors' })).toBeInTheDocument()
  })

  it('has no pill before the corridor is known', () => {
    open()
    expect(screen.queryByRole('button', { name: /Germany/ })).not.toBeInTheDocument()
  })

  it('has no tab bar', () => {
    open()
    expect(screen.getAllByRole('navigation')).toHaveLength(1)
  })
})

describe('AppShell · tablet', () => {
  it('has the logo mark, compact sections and no language select; signed in: an icon-only add button', async () => {
    setViewportWidth(834)
    open({ signedIn: true })
    expect(screen.getByText('landly')).toHaveClass('sr-only')
    expect(screen.queryByLabelText('Language')).not.toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Add organization' })).toHaveAttribute('href', '/add')
    expect(screen.getByRole('link', { name: 'Map' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'People' })).toBeInTheDocument()
  })

  it('guest: sign in and sign up', () => {
    setViewportWidth(834)
    open()
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Create account' })).toBeInTheDocument()
  })
})

describe('AppShell · phone', () => {
  it('guest: a tab bar with the sections and sign in, no top bar', () => {
    setViewportWidth(375)
    open()
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    const tabs = screen.getByRole('navigation', { name: 'Main' })
    expect(within(tabs).getAllByRole('link').map((a) => a.textContent)).toEqual(['Map', 'People', 'Countries', 'Sign in'])
    expect(within(tabs).getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/signin')
  })

  it('signed in: the tab bar has a round add button in the middle, saved and the account', () => {
    setViewportWidth(375)
    open({ signedIn: true })
    const tabs = screen.getByRole('navigation', { name: 'Main' })
    expect(within(tabs).getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual(['/map', '/people', '/add', '/saved', '/account'])
    expect(within(tabs).getByRole('link', { name: 'Add organization' })).toBeInTheDocument()
    expect(within(tabs).getByRole('link', { name: 'Me' })).toBeInTheDocument()
  })
})

describe('useAppShell', () => {
  it('is a no-op outside the shell, so a screen can be rendered on its own', async () => {
    renderApp(<Page />)
    await userEvent.click(screen.getByRole('button', { name: 'open the picker' }))
    expect(screen.getByRole('button', { name: 'open the picker' })).toBeInTheDocument()
  })
})
