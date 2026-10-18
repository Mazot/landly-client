import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

/** Icon + short secondary text: visits, vouches, distance, "2 days ago". */
export function Meta({ icon, strong, children }: { icon?: IconName; strong?: boolean; children: ReactNode }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 text-label leading-none whitespace-nowrap', strong ? 'font-semibold text-ink-2' : 'font-medium text-ink-3')}>
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  )
}
