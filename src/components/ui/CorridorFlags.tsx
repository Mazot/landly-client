import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

export interface CorridorFlagsProps {
  /** `Country.flag` emoji of the home country. */
  from: string
  /** `Country.flag` emoji of the destination. */
  to: string
  /** Accessible name, e.g. "Russia → Germany". */
  label: string
  size?: 'sm' | 'md' | 'lg'
  /** Visible text after the flags. */
  children?: ReactNode
}

const SIZES = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' } as const

/** Corridor as flags: 🇷🇺 → 🇩🇪. */
export function CorridorFlags({ from, to, label, size = 'sm', children }: CorridorFlagsProps) {
  return (
    <span className="inline-flex items-center gap-1.5 leading-none whitespace-nowrap">
      <span role="img" aria-label={label} className={clsx('inline-flex items-center gap-1.5', SIZES[size])}>
        <span aria-hidden="true">{from}</span>
        <Icon name="arrowRight" size={size === 'sm' ? 12 : 14} strokeWidth={2} className="text-accent" />
        <span aria-hidden="true">{to}</span>
      </span>
      {children && <span className="text-label font-semibold">{children}</span>}
    </span>
  )
}
