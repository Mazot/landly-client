import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

export interface StatProps {
  value: ReactNode
  label: ReactNode
  icon?: IconName
  variant?: 'default' | 'sunken'
}

/** Number tile: account stats, community check-ins. */
export function Stat({ value, label, icon, variant = 'default' }: StatProps) {
  return (
    <div className={clsx('min-w-0 rounded-r3 border border-border-1 px-3.5 py-3', variant === 'sunken' ? 'bg-surface-2' : 'bg-surface shadow-1')}>
      {icon && <Icon name={icon} size={15} className="mb-2.25 text-ink-3" />}
      <div className="text-xl leading-none font-bold text-ink-1">{value}</div>
      <div className="mt-1.25 text-xs font-medium text-ink-3">{label}</div>
    </div>
  )
}
