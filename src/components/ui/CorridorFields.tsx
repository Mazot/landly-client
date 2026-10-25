import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

export interface CorridorFieldsProps {
  /** A `Field` with the origin `Select`. */
  from: ReactNode
  /** A `Field` with the destination `Select`. */
  to: ReactNode
  /** Stack the two fields on phones (landing card) instead of keeping them side by side. */
  stackOnPhone?: boolean
  className?: string
}

/** "From → To" pair of country fields joined by the accent arrow. */
export function CorridorFields({ from, to, stackOnPhone, className }: CorridorFieldsProps) {
  return (
    <div className={clsx('flex gap-2', stackOnPhone ? 'flex-col md:flex-row md:items-end' : 'items-end', className)}>
      <div className="min-w-0 flex-1">{from}</div>
      <span aria-hidden className={clsx('h-11.5 w-5 shrink-0 items-center justify-center text-accent', stackOnPhone ? 'hidden md:flex' : 'flex')}>
        <Icon name="arrowRight" size={16} strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">{to}</div>
    </div>
  )
}
