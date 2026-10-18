import clsx from 'clsx'

export interface ProgressProps {
  /** 0–100. */
  value: number
  /** File name or what is loading; also the accessible name. */
  label: string
  showValue?: boolean
  className?: string
}

/** Thin progress bar with label and percentage (photo upload). */
export function Progress({ value, label, showValue = true, className }: ProgressProps) {
  const pct = Math.round(Math.max(0, Math.min(100, value)))
  return (
    <div className={clsx('min-w-0', className)}>
      <div className="mb-1.5 flex justify-between gap-2 text-xs leading-none font-semibold text-ink-3">
        <span className="truncate">{label}</span>
        {showValue && <span>{pct}%</span>}
      </div>
      <div role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="h-1.25 overflow-hidden rounded-full bg-surface-2 ring-1 ring-border-1 ring-inset">
        <div className="h-full rounded-full bg-accent transition-[width] motion-reduce:transition-none" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
