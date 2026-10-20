import clsx from 'clsx'
import type { ReactNode } from 'react'
import { TONE_CLASSES, type Tone } from './constants/tones'
import { Icon, type IconName } from './Icon'

export interface BadgeProps {
  tone?: Tone
  icon?: IconName
  size?: 'md' | 'lg'
  className?: string
  children: ReactNode
}

/** Small state label: Verified, Primary, Paid, 3 reports. 22 / 26 px. */
export function Badge({ tone = 'neutral', icon, size = 'md', className, children }: BadgeProps) {
  const t = TONE_CLASSES[tone]
  return (
    <span
      className={clsx(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border text-xs leading-none font-bold whitespace-nowrap',
        size === 'lg' ? 'h-6.5 px-3' : 'h-5.5 px-2.5',
        t.soft,
        t.fg,
        className,
      )}
    >
      {icon && <Icon name={icon} size={size === 'lg' ? 12 : 11} strokeWidth={2.2} />}
      {children}
    </span>
  )
}
