import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import i18n from '@/i18n'
import { renderApp } from '@/test/render'
import { LanguageSelect } from '../LanguageSelect'

describe('LanguageSelect', () => {
  afterEach(() => i18n.changeLanguage('en'))

  it('shows the current language by its own name and switches the UI', async () => {
    renderApp(<LanguageSelect />)
    const select = screen.getByLabelText('Language')
    expect(select).toHaveValue('en')
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['English', 'Русский', 'Українська'])

    await userEvent.selectOptions(select, 'ru')

    expect(i18n.resolvedLanguage).toBe('ru')
    expect(screen.getByLabelText('Язык')).toHaveValue('ru')
    expect(localStorage.getItem('i18nextLng')).toBe('ru')
  })
})
