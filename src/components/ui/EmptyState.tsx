import clsx from 'clsx'
import type { ReactNode } from 'react'
import type { Tone } from './constants/tones'
import type { IconName } from './Icon'
import { IconTile } from './IconTile'

export interface EmptyStateProps {
  icon: IconName
  tone?: Tone
  title: ReactNode
  description?: ReactNode
  /** Usually a `<Button variant="secondary" size="sm">`. */
  action?: ReactNode
  /** Mono label in the corner — API error code ("429", "oauth/exchange"). */
  code?: string
  align?: 'start' | 'center'
  card?: boolean
  className?: string
}

/** Empty lists and API error states (401 / 403 / 422 / 429 / 503, upload limits, expired claim). */
export function EmptyState({ icon, tone = 'neutral', title, description, action, code, align = 'start', card = true, className }: EmptyStateProps) {
  const center = align === 'center'
  return (
    <div className={clsx('min-w-0', center ? 'flex flex-col items-center px-6 py-9 text-center' : 'p-5.5', card && 'rounded-r3 border border-border-1 bg-surface shadow-1', className)}>
      <div className={clsx('flex w-full items-start gap-3', center ? 'justify-center' : 'justify-between')}>
        <IconTile icon={icon} tone={tone} size="lg" />
        {code && <span className="font-mono text-xs text-ink-4">{code}</span>}
      </div>
      <div className="mt-4 text-base leading-snug font-bold text-ink-1">{title}</div>
      {description && <div className={clsx('mt-1.5 text-sm font-medium text-pretty text-ink-3', center && 'max-w-sm')}>{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
