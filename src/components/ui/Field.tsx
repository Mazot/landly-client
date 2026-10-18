import clsx from 'clsx'
import { useId, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { UI_NS } from './i18n'
import { FieldContext } from './lib/internal'

export interface FieldProps {
  label?: ReactNode
  /** Shows "Optional" next to the label. */
  optional?: boolean
  hint?: ReactNode
  /** Replaces the hint, marks the control invalid and is announced. */
  error?: ReactNode
  /** Id of the control; generated when omitted. */
  id?: string
  className?: string
  children: ReactNode
}

/**
 * Label + hint / error around one control. DS controls inside (TextField,
 * TextArea, Select) pick up the id, `aria-describedby` and invalid state.
 */
export function Field({ label, optional, hint, error, id, className, children }: FieldProps) {
  const { t } = useTranslation(UI_NS)
  const generated = useId()
  const controlId = id ?? generated
  const note = error ?? hint
  const noteId = note ? `${controlId}-note` : undefined
  return (
    <div className={clsx('flex min-w-0 flex-col gap-1.75', className)}>
      {label && (
        <label htmlFor={controlId} className="flex justify-between gap-2 text-label leading-none font-semibold text-ink-2">
          <span>{label}</span>
          {optional && <span className="text-xs font-medium text-ink-4">{t('optional')}</span>}
        </label>
      )}
      <FieldContext.Provider value={{ id: controlId, describedBy: noteId, invalid: !!error }}>{children}</FieldContext.Provider>
      {note && (
        <div id={noteId} role={error ? 'alert' : undefined} className={clsx('text-xs leading-normal font-medium', error ? 'text-danger' : 'text-ink-3')}>
          {note}
        </div>
      )}
    </div>
  )
}
