import clsx from 'clsx'
import type { ReactNode } from 'react'

export interface EyebrowProps {
  as?: 'p' | 'div' | 'span'
  /** Layout only. */
  className?: string
  children: ReactNode
}

/** The small uppercase line above a title: "Showing in this area", "New". `PageHeader eyebrow` uses it too. */
export function Eyebrow({ as: As = 'p', className, children }: EyebrowProps) {
  return <As className={clsx('m-0 text-label leading-none font-medium tracking-wider text-ink-3 uppercase', className)}>{children}</As>
}
