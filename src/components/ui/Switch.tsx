import clsx from 'clsx'
import { FOCUS_RING } from './lib/classes'
import { useControllableState } from './lib/internal'

export interface SwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  /** Accessible name (visible text usually sits next to it — see ToggleRow). */
  label: string
  disabled?: boolean
}

/** On/off toggle (opening hours, privacy). 42×24 track inside a 44 px hit area. */
export function Switch({ checked, defaultChecked = false, onChange, label, disabled }: SwitchProps) {
  const [on, setOn] = useControllableState(checked, defaultChecked, onChange)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => setOn(!on)}
      className={clsx('inline-flex size-11 shrink-0 touch-manipulation items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-45 lg:h-6 lg:w-10.5', FOCUS_RING)}
    >
      <span className={clsx('flex h-6 w-10.5 items-center rounded-full p-0.5 transition-colors', on ? 'bg-success' : 'bg-border-2')}>
        <span className={clsx('size-5 rounded-full bg-surface shadow-1 transition-transform motion-reduce:transition-none', on && 'translate-x-4.5')} />
      </span>
    </button>
  )
}
