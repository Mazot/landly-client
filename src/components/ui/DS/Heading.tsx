import clsx from 'clsx'
import type { ReactNode } from 'react'

export type HeadingSize = 'sm' | 'md' | 'lg' | 'display'

const SIZES: Record<HeadingSize, string> = {
  sm: 'text-sm leading-tight font-bold',
  md: 'text-lg leading-tight font-bold',
  lg: 'text-2xl leading-tight font-bold',
  display: 'font-display text-display-lg font-normal',
}

export interface HeadingProps {
  /** `span` / `p` for a figure or a title that is not a document heading. */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
  /** sm 14 (a form group) · md 17 (a block, default) · lg 24 (a panel title) · display 48 serif (a big figure). */
  size?: HeadingSize
  /** Layout only. */
  className?: string
  children: ReactNode
}

/** A bold sans title outside `PageHeader`: list and panel headings, a block's title, a big serif figure. */
export function Heading({ as: As = 'h2', size = 'md', className, children }: HeadingProps) {
  return <As className={clsx('m-0 text-ink-1', SIZES[size], className)}>{children}</As>
}
