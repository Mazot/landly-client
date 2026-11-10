import { CorridorFlags } from './CorridorFlags'
import { FOCUS_RING } from './lib/classes'

export interface CorridorBubbleProps {
  from: string | null
  to: string | null
  /** Accessible name of the corridor: "Russia → Germany". */
  label: string
  /** "234 places". */
  title: string
  /** "4 embassies · 12 new this week". */
  detail?: string
  /** Opens the corridor picker. */
  onClick?: () => void
}

/** Dark corridor summary floating over the map: flags, live places, what is new. */
export function CorridorBubble({ from, to, label, title, detail, onClick }: CorridorBubbleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      className={`flex max-w-full cursor-pointer touch-manipulation items-center gap-3 rounded-r3 bg-ink-1 px-3.5 py-2.5 text-left text-surface shadow-3 ${FOCUS_RING}`}
    >
      <CorridorFlags from={from} to={to} label={label} size="md" />
      <span aria-hidden="true" className="h-5.5 w-px shrink-0 bg-surface/15" />
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-label leading-none font-bold">{title}</span>
        {detail && <span className="truncate text-xs leading-none font-medium text-surface/60">{detail}</span>}
      </span>
    </button>
  )
}
