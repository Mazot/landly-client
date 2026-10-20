import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Icon } from './Icon'
import { useControllableState } from './lib/internal'

export interface CheckboxProps {
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  label: ReactNode
  description?: ReactNode
  className?: string
}

/** Checkbox with a label and optional description (consent, agreements). */
export function Checkbox({ checked, defaultChecked = false, onChange, label, description, className }: CheckboxProps) {
  const [on, setOn] = useControllableState(checked, defaultChecked, onChange)
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      onClick={() => setOn(!on)}
      className={clsx('group flex min-h-11 w-full touch-manipulation items-start gap-3 py-1 text-left outline-none', className)}
    >
      <span
        className={clsx(
          'mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-r1 border-2 text-surface transition-colors group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-ink-1',
          on ? 'border-ink-1 bg-ink-1' : 'border-border-2 bg-surface',
        )}
      >
        {on && <Icon name="check" size={12} strokeWidth={2.6} />}
      </span>
      <span className="min-w-0">
        <span className="block text-sm leading-snug font-semibold text-ink-1">{label}</span>
        {description && <span className="mt-0.75 block text-label font-medium text-ink-3">{description}</span>}
      </span>
    </button>
  )
}
