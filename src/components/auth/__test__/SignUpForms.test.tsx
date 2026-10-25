import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n'
import { useCorridorStore } from '@/stores/corridorStore'
import { country } from '@/test/factories'
import { renderApp } from '@/test/render'
import { capture } from '@/test/server'
import { SignUpAccountForm } from '../SignUpAccountForm'
import { SignUpProfileForm } from '../SignUpProfileForm'

describe('SignUpAccountForm (step 1)', () => {
  const type = async (username: string, email: string, password: string) => {
    const user = userEvent.setup()
    if (username) await user.type(screen.getByLabelText('Username'), username)
    if (email) await user.type(screen.getByLabelText('Email'), email)
    if (password) await user.type(screen.getByLabelText('Password'), password)
    await user.click(screen.getByRole('button', { name: /Continue/ }))
  }

  it('hands the trimmed account to the next step', async () => {
    const onContinue = vi.fn()
    renderApp(<SignUpAccountForm onContinue={onContinue} />)

    await type('  anna.m ', ' anna@mail.com ', 'password123')

    await waitFor(() => expect(onContinue).toHaveBeenCalledWith({ username: 'anna.m', email: 'anna@mail.com', password: 'password123' }))
  })

  it('shows the field rules as hints and every broken rule as an error', async () => {
    const onContinue = vi.fn()
    renderApp(<SignUpAccountForm onContinue={onContinue} />)
    expect(screen.getByLabelText('Username')).toHaveAccessibleDescription('3–50 characters, no spaces')
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription('At least 8 characters')

    await type('a b', 'nope', 'short')

    expect(await screen.findByText('No spaces allowed')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument()
    expect(screen.getByText('Use at least 8 characters')).toBeInTheDocument()
    expect(onContinue).not.toHaveBeenCalled()
  })

  it('keeps the entered account when the user comes back from step 2', () => {
    renderApp(<SignUpAccountForm defaultValues={{ username: 'anna.m', email: 'a@b.io', password: 'password123' }} onContinue={vi.fn()} />)
    expect(screen.getByLabelText('Username')).toHaveValue('anna.m')
    expect(screen.getByLabelText('Email')).toHaveValue('a@b.io')
  })

  it.each([
    ['username', 'This username is taken', 'Username'],
    ['email', 'An account with this email already exists', 'Email'],
  ] as const)('shows a server-side %s conflict until the field is edited', async (conflict, message, label) => {
    const onEdit = vi.fn()
    renderApp(<SignUpAccountForm conflict={conflict} onEdit={onEdit} onContinue={vi.fn()} />)
    expect(screen.getByText(message)).toBeInTheDocument()
    expect(screen.getByLabelText(label)).toBeInvalid()

    await userEvent.type(screen.getByLabelText(label), 'x')

    expect(onEdit).toHaveBeenCalled()
  })

  it('does not report an edit of a field that is not in conflict', async () => {
    const onEdit = vi.fn()
    renderApp(<SignUpAccountForm conflict="username" onEdit={onEdit} onContinue={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Email'), 'a')
    await userEvent.type(screen.getByLabelText('Password'), 'a')
    expect(onEdit).not.toHaveBeenCalled()
  })

  it('links to sign-in', () => {
    renderApp(<SignUpAccountForm onContinue={vi.fn()} />)
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/signin')
  })
})

describe('SignUpProfileForm (step 2)', () => {
  const account = { username: 'anna.m', email: 'anna@mail.com', password: 'password123' }
  const russia = country({ name: 'Russia', flag: '🇷🇺' })
  const germany = country({ name: 'Germany', flag: '🇩🇪' })
  const ukraine = country({ name: 'Ukraine', flag: '🇺🇦' })

  afterEach(async () => {
    useCorridorStore.setState({ fromId: null, toId: null })
    await i18n.changeLanguage('en')
  })

  async function open(props: Partial<React.ComponentProps<typeof SignUpProfileForm>> = {}, countries = [russia, germany, ukraine]) {
    capture('get', '/api/common/countries', countries)
    const onSubmit = vi.fn()
    const onBack = vi.fn()
    renderApp(<SignUpProfileForm account={account} onBack={onBack} onSubmit={onSubmit} {...props} />)
    await screen.findAllByRole('option', { name: /Ukraine/ })
    return { onSubmit, onBack }
  }

  it('sends the whole profile and the default corridor, with the home country = from', async () => {
    const { onSubmit } = await open()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/Your name/), '  Anna Morozova ')
    await user.click(screen.getByRole('button', { name: 'Helping others' }))
    await user.click(screen.getByRole('radio', { name: 'Terracotta' }))
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit.mock.calls[0][0]).toEqual({
      ...account,
      locale: 'en',
      name: 'Anna Morozova',
      here_as: 'helping',
      avatar_color: '#C7613F',
      home_country_id: russia.id,
      corridor_from_country_id: russia.id,
      corridor_to_country_id: germany.id,
    })
  })

  it('sends the corridor the guest picked, swapping instead of equalising', async () => {
    const { onSubmit } = await open()
    const user = userEvent.setup()

    await user.selectOptions(screen.getByLabelText('To'), ukraine.id)
    await user.selectOptions(screen.getByLabelText('From'), ukraine.id)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ corridor_from_country_id: ukraine.id, corridor_to_country_id: russia.id })
  })

  it('leaves out an empty name', async () => {
    const { onSubmit } = await open()
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('name')
  })

  it('"Skip for now" sends the account alone, with the language it is shown in', async () => {
    await i18n.changeLanguage('ru')
    const { onSubmit } = await open()

    await userEvent.click(screen.getByRole('button', { name: 'Пропустить' }))

    expect(onSubmit).toHaveBeenCalledWith({ ...account, locale: 'ru' })
  })

  it('switches the interface language together with the language field', async () => {
    const { onSubmit } = await open()
    await userEvent.selectOptions(screen.getByLabelText(/Interface language/), 'uk')
    expect(i18n.resolvedLanguage).toBe('uk')

    await userEvent.click(await screen.findByRole('button', { name: 'Створити акаунт' }))

    await waitFor(() => expect(onSubmit.mock.calls[0][0]).toMatchObject({ locale: 'uk' }))
  })

  it('refuses a name over 100 characters', async () => {
    const { onSubmit } = await open()
    await userEvent.type(screen.getByLabelText(/Your name/), 'a'.repeat(101))
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('Use at most 100 characters')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('still creates the account without a corridor when the country list is missing', async () => {
    const onSubmit = vi.fn()
    capture('get', '/api/common/countries', { error: 'boom' }, 500)
    renderApp(<SignUpProfileForm account={account} onBack={vi.fn()} onSubmit={onSubmit} />)
    expect(await screen.findByText(/Couldn't load the country list/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    const request = onSubmit.mock.calls[0][0]
    expect(request).not.toHaveProperty('corridor_from_country_id')
    expect(request).not.toHaveProperty('home_country_id')
  })

  it('goes back, shows a failure and ignores "Skip" while a request is running', async () => {
    const { onBack, onSubmit } = await open({ failure: 'tooManyRequests', pending: true })
    expect(screen.getByRole('alert')).toHaveTextContent('Too many attempts')
    expect(screen.getByRole('button', { name: 'Create account' })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Skip for now' }))
    expect(onSubmit).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('names the swatches and the steps for assistive technology', async () => {
    await open()
    expect(within(screen.getByRole('radiogroup', { name: 'Avatar colour' })).getAllByRole('radio').map((r) => r.getAttribute('aria-label'))).toEqual(['Blue', 'Terracotta', 'Green', 'Plum', 'Ochre', 'Ink'])
    expect(screen.getByRole('progressbar', { name: 'Step 2 of 2' })).toBeInTheDocument()
  })
})
