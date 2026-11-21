import clsx from 'clsx'
import type { ReactNode, Ref } from 'react'

export type CardVariant = 'default' | 'selected' | 'dashed' | 'sunken' | 'elevated' | 'floating'

// Each variant sets its own radius and border: two utilities of one kind resolve by CSS order, not class order.
const VARIANTS: Record<CardVariant, string> = {
  default: 'rounded-r3 border border-border-1 bg-surface shadow-1',
  selected: 'rounded-r3 border border-ink-1 bg-surface shadow-2',
  dashed: 'rounded-r3 border border-dashed border-border-2 bg-surface',
  sunken: 'rounded-r3 border border-border-1 bg-surface-2',
  elevated: 'rounded-r3 border border-transparent bg-surface shadow-3',
  floating: 'rounded-r4 bg-surface shadow-pop',
}
const PADDING = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-5' } as const

export interface CardProps {
  /** `floating` — a borderless panel over the map (larger radius, pop shadow). */
  variant?: CardVariant
  padding?: keyof typeof PADDING
  /** Hover state for clickable cards (wrap in a link or pass onClick to a ListItem instead). */
  interactive?: boolean
  as?: 'div' | 'section' | 'article' | 'li'
  /** Names a `section` card that has no visible heading of its own. */
  'aria-label'?: string
  /** The scroll container of a floating panel, for scrolling it back to the top. */
  ref?: Ref<HTMLDivElement>
  className?: string
  children: ReactNode
}

/** White surface with a hairline border — the base of every panel. */
export function Card({ variant = 'default', padding = 'md', interactive, as = 'div', 'aria-label': ariaLabel, ref, className, children }: CardProps) {
  // One element type for the ref: the tag only changes semantics, never the DOM interface used.
  const As = as as 'div'
  return (
    <As
      ref={ref}
      aria-label={ariaLabel}
      className={clsx('min-w-0', VARIANTS[variant], PADDING[padding], interactive && 'cursor-pointer transition-shadow hover:border-border-2 hover:shadow-2', className)}
    >
      {children}
    </As>
  )
}
