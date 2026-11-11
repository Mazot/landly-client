import clsx from 'clsx'
import type { ReactNode } from 'react'

export interface SectionProps {
  title?: ReactNode
  subtitle?: ReactNode
  /** Right side of the heading — usually a TextLink ("See all 6"). */
  action?: ReactNode
  as?: 'h2' | 'h3' | 'h4'
  /** `sm` — a form group's heading (14 px) instead of a page block's (17 px). */
  size?: 'md' | 'sm'
  className?: string
  children: ReactNode
}

/** Page block with a heading row. Vertical rhythm is set by the page (`gap-*`). */
export function Section({ title, subtitle, action, as: Heading = 'h3', size = 'md', className, children }: SectionProps) {
  return (
    <section className={clsx('min-w-0', className)}>
      {(title || action) && (
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            {title && <Heading className={clsx('m-0 leading-tight font-bold text-ink-1', size === 'sm' ? 'text-sm' : 'text-lg')}>{title}</Heading>}
            {subtitle && <div className="mt-1 text-label font-medium text-ink-3">{subtitle}</div>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
