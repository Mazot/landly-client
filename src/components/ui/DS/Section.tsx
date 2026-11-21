import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Heading as Title } from './Heading'

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
export function Section({ title, subtitle, action, as = 'h3', size = 'md', className, children }: SectionProps) {
  return (
    <section className={clsx('min-w-0', className)}>
      {(title || action) && (
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <Title as={as} size={size}>
                {title}
              </Title>
            )}
            {subtitle && <div className="mt-1 text-label font-medium text-ink-3">{subtitle}</div>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
