import clsx from 'clsx'
import { Icon, type IconName } from './Icon'
import { FOCUS_RING } from './lib/classes'
import { onRadioGroupKeyDown, radioTabIndex, useControllableState } from './lib/internal'

export interface SegmentedOption<T extends string = string> {
  value: T
  label: string
  icon?: IconName
  /** Muted number after the label ("Places 4"). */
  count?: number
}

export interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[]
  /** Accessible name of the group. */
  label: string
  value?: T
  /** Defaults to the first option. */
  defaultValue?: T
  onChange?: (value: T) => void
  /** Stretch to the full width. */
  block?: boolean
  size?: 'md' | 'sm'
}

/** One-of-few switch: cost, sort, Saved tabs, moderation queue filter. */
export function Segmented<T extends string>({ options, label, value, defaultValue, onChange, block, size = 'md' }: SegmentedProps<T>) {
  // `options` may still be empty (data loading): nothing is selected then.
  const [current, setCurrent] = useControllableState<T | undefined>(value, defaultValue ?? options[0]?.value, onChange as (v: T | undefined) => void)
  const checkedIndex = options.findIndex((o) => o.value === current)
  return (
    <div role="radiogroup" aria-label={label} onKeyDown={(e) => onRadioGroupKeyDown(e, (i) => setCurrent(options[i].value))} className={clsx('max-w-full gap-0.75 overflow-x-auto rounded-r2 border border-border-1 bg-surface-2 p-0.75', block ? 'flex w-full' : 'inline-flex')}>
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
            className={clsx(
              'flex min-h-11 touch-manipulation items-center justify-center gap-1.5 rounded-r2 leading-none font-semibold whitespace-nowrap transition-colors lg:min-h-0',
              FOCUS_RING,
              block ? 'flex-1' : 'flex-none',
              size === 'md' ? 'px-3.25 text-label lg:h-8' : 'px-2.5 text-xs lg:h-7',
              on ? 'bg-surface text-ink-1 shadow-1' : 'text-ink-3 hover:text-ink-1',
            )}
          >
            {o.icon && <Icon name={o.icon} size={14} />}
            {o.label}
            {o.count !== undefined && <span className="text-ink-4">{o.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
