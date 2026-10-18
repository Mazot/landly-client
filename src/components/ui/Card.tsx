import clsx from 'clsx'
import type { ReactNode } from 'react'

export type CardVariant = 'default' | 'selected' | 'dashed' | 'sunken' | 'elevated'

const VARIANTS: Record<CardVariant, string> = {
  default: 'border-border-1 bg-surface shadow-1',
  selected: 'border-ink-1 bg-surface shadow-2',
  dashed: 'border-dashed border-border-2 bg-surface',
  sunken: 'border-border-1 bg-surface-2',
  elevated: 'border-transparent bg-surface shadow-3',
}
const PADDING = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-5' } as const

export interface CardProps {
  variant?: CardVariant
  padding?: keyof typeof PADDING
  /** Hover state for clickable cards (wrap in a link or pass onClick to a ListItem instead). */
  interactive?: boolean
  as?: 'div' | 'section' | 'article' | 'li'
  className?: string
  children: ReactNode
}

/** White surface with a hairline border — the base of every panel. */
export function Card({ variant = 'default', padding = 'md', interactive, as: As = 'div', className, children }: CardProps) {
  return (
    <As className={clsx('min-w-0 rounded-r3 border', VARIANTS[variant], PADDING[padding], interactive && 'cursor-pointer transition-shadow hover:border-border-2 hover:shadow-2', className)}>
      {children}
    </As>
  )
}
