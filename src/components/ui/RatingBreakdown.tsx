import clsx from 'clsx'

export interface RatingBreakdownRow {
  /** The rating (1–5). */
  rating: number
  /** Reviews that gave it. */
  count: number
}

export interface RatingBreakdownProps {
  /** One row per rating, highest first (`ReviewSummary.byRating`). */
  rows: RatingBreakdownRow[]
  /** Accessible name of the list. */
  label: string
  /** Accessible text of one row ("5 stars: 12"). */
  rowLabel: (row: RatingBreakdownRow) => string
  className?: string
}

/** How many reviews gave each rating: the rating and a bar scaled to the most common one. */
export function RatingBreakdown({ rows, label, rowLabel, className }: RatingBreakdownProps) {
  const most = Math.max(0, ...rows.map((row) => row.count))
  return (
    <ul aria-label={label} className={clsx('m-0 flex min-w-0 list-none flex-col gap-1.25 p-0', className)}>
      {rows.map((row) => (
        <li key={row.rating} aria-label={rowLabel(row)} className="flex items-center gap-2 text-xs leading-none font-semibold text-ink-3">
          <span aria-hidden className="w-2 text-center">
            {row.rating}
          </span>
          <span aria-hidden className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
            <span className="block h-full rounded-full bg-star" style={{ width: `${most > 0 ? (row.count / most) * 100 : 0}%` }} />
          </span>
        </li>
      ))}
    </ul>
  )
}
