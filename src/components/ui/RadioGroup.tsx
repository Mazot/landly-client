import clsx from 'clsx'
import type { ReactNode } from 'react'
import { onRadioGroupKeyDown, radioTabIndex, useControllableState } from './lib/internal'

export interface RadioOption<T extends string = string> {
  value: T
  label: ReactNode
  description?: ReactNode
}

export interface RadioGroupProps<T extends string> {
  options: RadioOption<T>[]
  /** Accessible name of the group. */
  label: string
  value?: T | null
  defaultValue?: T | null
  onChange?: (value: T) => void
}

/** Vertical list of mutually exclusive options (report reasons). */
export function RadioGroup<T extends string>({ options, label, value, defaultValue = null, onChange }: RadioGroupProps<T>) {
  const [current, setCurrent] = useControllableState<T | null | undefined>(value, defaultValue, onChange as (v: T | null | undefined) => void)
  const checkedIndex = options.findIndex((o) => o.value === current)
  return (
    <div role="radiogroup" aria-label={label} onKeyDown={(e) => onRadioGroupKeyDown(e, (i) => setCurrent(options[i].value))} className="flex flex-col">
      {options.map((o, i) => {
        const on = o.value === current
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={radioTabIndex(i, checkedIndex)}
            onClick={() => setCurrent(o.value)}
            className="group flex min-h-11 w-full touch-manipulation items-start gap-3 px-0.5 py-2.75 text-left outline-none"
          >
            <span
              className={clsx(
                'inline-flex size-5 shrink-0 items-center justify-center rounded-full border-2 bg-surface group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-ink-1',
                on ? 'border-ink-1' : 'border-border-2',
              )}
            >
              {on && <span className="size-2.5 rounded-full bg-ink-1" />}
            </span>
            <span className="min-w-0">
              <span className="block text-sm leading-snug font-semibold text-ink-1">{o.label}</span>
              {o.description && <span className="mt-0.75 block text-label font-medium text-ink-3">{o.description}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}
