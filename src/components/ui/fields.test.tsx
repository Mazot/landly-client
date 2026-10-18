import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Field } from './Field'
import { SearchField } from './SearchField'
import { Select } from './Select'
import { TextArea } from './TextArea'
import { TextField } from './TextField'

const COUNTRIES = [
  { value: 'ru', label: 'Russia' },
  { value: 'de', label: 'Germany' },
]

describe('Field', () => {
  it('links label, hint and control', () => {
    render(
      <Field label="Username" optional hint="3–50 characters">
        <TextField icon="user" />
      </Field>,
    )
    const input = screen.getByLabelText(/Username/)
    expect(input).toHaveAccessibleDescription('3–50 characters')
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(screen.getByText('Optional')).toBeInTheDocument()
  })

  it('announces the error and marks every DS control invalid', () => {
    render(
      <>
        <Field label="Email" error="Already registered" id="email"><TextField /></Field>
        <Field label="Note" error="Required"><TextArea /></Field>
        <Field label="Country" error="Pick one"><Select options={COUNTRIES} /></Field>
      </>,
    )
    expect(screen.getAllByRole('alert')).toHaveLength(3)
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'email')
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Note')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Country')).toHaveAttribute('aria-invalid', 'true')
  })

  it('renders without a label or note', () => {
    render(<Field><TextField placeholder="Free" /></Field>)
    expect(screen.getByPlaceholderText('Free')).not.toHaveAttribute('aria-describedby')
  })
})

describe('TextField', () => {
  it('types, shows addon / leading / trailing and works outside a Field', async () => {
    const onChange = vi.fn()
    render(<TextField leading={<span>🇩🇪</span>} addon="WhatsApp" trailing={<b>!</b>} size="sm" variant="floating" invalid disabled={false} onChange={onChange} aria-label="Phone" />)
    await userEvent.type(screen.getByRole('textbox', { name: 'Phone' }), '+49')
    expect(onChange).toHaveBeenCalledTimes(3)
    expect(screen.getByText('WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('🇩🇪')).toBeInTheDocument()
    expect(screen.getByText('!')).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    render(<TextField type="password" aria-label="Password" defaultValue="secret" disabled />)
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')
    await userEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(input).toHaveAttribute('type', 'text')
    await userEvent.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('SearchField is a search box', () => {
    render(<SearchField aria-label="Search" />)
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument()
  })
})

describe('TextArea', () => {
  it('accepts text and its own invalid flag', async () => {
    render(<TextArea aria-label="Review" invalid={false} rows={4} />)
    const area = screen.getByRole('textbox', { name: 'Review' })
    await userEvent.type(area, 'Great')
    expect(area).toHaveValue('Great')
    expect(area).toHaveAttribute('rows', '4')
  })
})

describe('Select', () => {
  it('starts on the placeholder and changes value', async () => {
    const onChange = vi.fn()
    render(<Select aria-label="To" options={COUNTRIES} placeholder="Destination" icon="globe" onChange={onChange} />)
    const select = screen.getByRole('combobox', { name: 'To' })
    expect(select).toHaveValue('')
    await userEvent.selectOptions(select, 'de')
    expect(select).toHaveValue('de')
    expect(onChange).toHaveBeenCalledOnce()
  })

  it('respects defaultValue, controlled value and leading content', () => {
    const { rerender } = render(<Select aria-label="From" options={COUNTRIES} defaultValue="de" leading={<span>🏳️</span>} size="sm" />)
    expect(screen.getByRole('combobox')).toHaveValue('de')
    rerender(<Select aria-label="From2" options={COUNTRIES} value="ru" onChange={() => {}} placeholder="Pick" />)
    expect(screen.getByRole('combobox', { name: 'From2' })).toHaveValue('ru')
  })
})
