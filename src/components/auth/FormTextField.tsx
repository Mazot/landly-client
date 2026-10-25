import type { AnyFieldApi } from '@tanstack/react-form'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Field, TextField, type TextFieldProps } from '@/components/ui'
import { firstErrorKey } from './schemas'

export interface FormTextFieldProps extends Omit<TextFieldProps, 'value' | 'onChange' | 'onBlur' | 'invalid'> {
  /** The TanStack Form field this input is bound to. */
  field: AnyFieldApi
  label: string
  /** Shows "Optional" next to the label. */
  optional?: boolean
  hint?: ReactNode
  /** Message from the server, shown when validation has none. */
  serverError?: string
  /** Mark the input invalid without a message (e.g. after a rejected sign-in). */
  invalid?: boolean
  /** Called when the user edits the value. */
  onEdit?: () => void
}

/** Labelled input bound to a form field: translates the first validation key into the error. */
export function FormTextField({ field, label, optional, hint, serverError, invalid, onEdit, ...input }: FormTextFieldProps) {
  const { t } = useTranslation()
  const key = firstErrorKey(field.state.meta.errors)
  const error = key ? t(key) : serverError
  return (
    <Field label={label} optional={optional} hint={hint} error={error}>
      <TextField
        {...input}
        invalid={!!error || invalid}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => {
          onEdit?.()
          field.handleChange(event.target.value)
        }}
      />
    </Field>
  )
}
