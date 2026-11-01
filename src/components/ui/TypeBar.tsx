import clsx from 'clsx'
import { isKnownOrgType, ORG_TYPE_CLASSES } from './constants/orgTypes'

export interface TypeBarSegment {
  /** Org type slug (`placesByType[].slug`); unknown slugs such as "other" render neutral. */
  slug: string
  label: string
  count: number
}

export interface TypeBarProps {
  segments: TypeBarSegment[]
  /** Accessible name of the legend list. */
  label: string
  className?: string
}

/** Stacked share-of-places bar by org type with a legend — corridor and country summaries. */
export function TypeBar({ segments, label, className }: TypeBarProps) {
  const total = segments.reduce((sum, s) => sum + s.count, 0)
  return (
    <div className={clsx('min-w-0', className)}>
      <div aria-hidden className="flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-border-1">
        {total > 0 &&
          segments
            .filter((s) => s.count > 0)
            .map((s) => (
              <span key={s.slug} style={{ flexGrow: s.count }} className={clsx('basis-0', isKnownOrgType(s.slug) ? ORG_TYPE_CLASSES[s.slug].dot : 'bg-ink-4')} />
            ))}
      </div>
      <ul aria-label={label} className="m-0 mt-3 flex list-none flex-wrap gap-x-4 gap-y-1.5 p-0 text-xs font-semibold text-ink-2">
        {segments.map((s) => (
          <li key={s.slug} className="inline-flex items-center gap-1.5">
            <span aria-hidden className={clsx('size-2 rounded-full', isKnownOrgType(s.slug) ? ORG_TYPE_CLASSES[s.slug].dot : 'bg-ink-4')} />
            {s.label}
            <span className="font-medium text-ink-3">{s.count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
