import clsx from 'clsx'
import { CorridorFlags } from './CorridorFlags'
import { Icon } from './DS/Icon'
import { FOCUS_RING } from './lib/classes'

export interface CorridorPillProps {
  /** `Country.flag` of the home country. */
  from: string | null
  /** `Country.flag` of the destination. */
  to: string | null
  /** Accessible name of the corridor: "Russia → Germany". */
  label: string
  /** Destination name shown after the flags. */
  name: string
  /** Dark variant for floating over the map. */
  dark?: boolean
  /** Opens the corridor picker. */
  onClick?: () => void
}

/** "🇷🇺 → 🇩🇪 Germany ⌄" — the current corridor, a button that opens the corridor picker. */
export function CorridorPill({ from, to, label, name, dark, onClick }: CorridorPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      className={clsx(
        'inline-flex min-h-11 shrink-0 cursor-pointer touch-manipulation items-center gap-1.75 rounded-full px-3 whitespace-nowrap lg:min-h-8.5',
        FOCUS_RING,
        dark ? 'bg-ink-1 text-surface' : 'border border-border-1 bg-surface-2 text-ink-1',
      )}
    >
      <CorridorFlags from={from} to={to} label={label}>
        {name}
      </CorridorFlags>
      <Icon name="chevronDown" size={13} className="opacity-60" />
    </button>
  )
}
