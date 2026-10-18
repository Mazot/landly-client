import clsx from 'clsx'
import type { ReactNode } from 'react'
import { TONE_CLASSES, type Tone } from './constants/tones'
import { Icon, type IconName } from './Icon'

export type IconTileSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const SIZES: Record<IconTileSize, string> = {
  xs: 'size-7.5 rounded-r2 text-sm',
  sm: 'size-8.5 rounded-r2 text-base',
  md: 'size-10.5 rounded-r3 text-xl',
  lg: 'size-11 rounded-r3 text-xl',
  xl: 'size-15 rounded-r4 text-3xl',
}
const ICON_SIZE: Record<IconTileSize, number> = { xs: 14, sm: 16, md: 18, lg: 20, xl: 28 }

export interface IconTileProps {
  icon?: IconName
  tone?: Tone
  /** 30 · 34 · 42 · 44 · 60 px. */
  size?: IconTileSize
  shape?: 'rounded' | 'circle'
  strokeWidth?: number
  /** Instead of the icon — e.g. a flag emoji. */
  children?: ReactNode
  className?: string
}

/** Square (or round) tile holding an icon or emoji: contacts, missions, states, uploads. */
export function IconTile({ icon, tone = 'neutral', size = 'md', shape = 'rounded', strokeWidth, children, className }: IconTileProps) {
  const t = TONE_CLASSES[tone]
  return (
    <span
      aria-hidden={children ? undefined : true}
      className={clsx('inline-flex shrink-0 items-center justify-center border leading-none', SIZES[size], shape === 'circle' && 'rounded-full', t.soft, t.fg, className)}
    >
      {children ?? (icon && <Icon name={icon} size={ICON_SIZE[size]} strokeWidth={strokeWidth} />)}
    </span>
  )
}
