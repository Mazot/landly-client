import clsx from 'clsx'
import type { ReactNode } from 'react'
import { DividedListContext, flattenChildren } from './lib/internal'

export interface ListProps {
  /** `stack` — separate rows with a gap; `divided` — one card, rows split by hairlines. */
  variant?: 'stack' | 'divided'
  gap?: 'sm' | 'md'
  /** Accessible name — renders a labelled ARIA list whose rows become list items. */
  label?: string
  className?: string
  children: ReactNode
}

/** Vertical list of ListItem / ToggleRow / KeyValue rows. */
export function List({ variant = 'stack', gap = 'md', label, className, children }: ListProps) {
  const divided = variant === 'divided'
  return (
    <DividedListContext.Provider value={divided}>
      <div
        role={label ? 'list' : undefined}
        aria-label={label}
        className={clsx(
          'flex min-w-0 flex-col',
          divided ? 'divide-y divide-border-1 rounded-r3 border border-border-1 bg-surface py-0.5 shadow-1' : gap === 'sm' ? 'gap-1' : 'gap-2',
          className,
        )}
      >
        {/* role="list" must own role="listitem" children, or assistive tech reads an empty list. */}
        {label
          ? flattenChildren(children).map((child, i) => (
              <div role="listitem" key={i} className="min-w-0">
                {child}
              </div>
            ))
          : children}
      </div>
    </DividedListContext.Provider>
  )
}
