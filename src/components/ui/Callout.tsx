import clsx from 'clsx'
import type { ReactNode } from 'react'
import { TONE_CLASSES, type Tone } from './constants/tones'
import { Icon, type IconName } from './Icon'

const DEFAULT_ICON: Record<Tone, IconName> = {
  neutral: 'eyeOff',
  surface: 'sparkle',
  success: 'check',
  warning: 'flag',
  danger: 'close',
  info: 'verified',
  accent: 'sparkle',
  note: 'pencil',
  dark: 'sparkle',
}

export interface CalloutProps {
  tone?: Tone
  /** Defaults per tone; `false` hides it. */
  icon?: IconName | false
  title?: ReactNode
  /** Buttons under the text. */
  actions?: ReactNode
  size?: 'md' | 'lg'
  className?: string
  children?: ReactNode
}

/** Inline message: errors, duplicate warning, privacy note, moderator note, saved-item note. */
export function Callout({ tone = 'neutral', icon, title, actions, size = 'md', className, children }: CalloutProps) {
  const t = TONE_CLASSES[tone]
  const name = icon === false ? null : (icon ?? DEFAULT_ICON[tone])
  return (
    <div role={tone === 'danger' ? 'alert' : undefined} className={clsx('flex items-start rounded-r3 border text-label font-medium', size === 'lg' ? 'gap-3 p-3.5' : 'gap-2.5 px-3.5 py-2.75', t.soft, t.ink, className)}>
      {name && <Icon name={name} size={size === 'lg' ? 16 : 14} strokeWidth={tone === 'danger' || tone === 'success' ? 2.2 : 1.8} className={clsx('mt-px', t.fg)} />}
      <div className="min-w-0 flex-1">
        {title && <div className="text-sm leading-snug font-bold">{title}</div>}
        {children && <div className={clsx(title && 'mt-0.75')}>{children}</div>}
        {actions && <div className="mt-2.5 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  )
}
