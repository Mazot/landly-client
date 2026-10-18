import clsx from 'clsx'
import { AVATAR_COLORS } from './tokens/tokens'
import { useControllableState } from './lib/internal'

export interface ColorSwatchesProps {
  /** Data colours (e.g. `avatar_color` choices). */
  colors?: readonly string[]
  /** Accessible name of the group. */
  label: string
  value?: string
  defaultValue?: string
  onChange?: (color: string) => void
}

/** Pick one colour from a palette — avatar colour on sign-up and profile edit. */
export function ColorSwatches({ colors = AVATAR_COLORS, label, value, defaultValue, onChange }: ColorSwatchesProps) {
  const [current, setCurrent] = useControllableState<string>(value, defaultValue ?? colors[0], onChange)
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap items-center lg:gap-1.75">
      {colors.map((c) => {
        const on = c === current
        return (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={c}
            onClick={() => setCurrent(c)}
            className="group inline-flex size-11 touch-manipulation items-center justify-center rounded-full outline-none lg:size-8"
          >
            <span
              className={clsx('size-6.5 rounded-full group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-ink-1', on && 'ring-2 ring-ink-1 ring-offset-2 ring-offset-surface')}
              style={{ backgroundColor: c }}
            />
          </button>
        )
      })}
    </div>
  )
}
