import clsx from 'clsx'
import { initialsOf } from './lib/internal'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const SIZES: Record<AvatarSize, string> = {
  xs: 'size-7.5 text-xs',
  sm: 'size-9 text-label',
  md: 'size-10 text-sm',
  lg: 'size-11.5 text-base',
  xl: 'size-16 text-2xl',
  '2xl': 'size-21 text-3xl',
}

export interface AvatarProps {
  /** Person / place name → initials and accessible name. */
  name: string
  initials?: string
  /** `avatar_color` from the server (data colour). Defaults to the info token. */
  color?: string | null
  src?: string | null
  size?: AvatarSize
  /** Rounded square — used for places. */
  square?: boolean
  className?: string
}

/** Initials on a colour, or a photo. 30 · 36 · 40 · 46 · 64 · 84 px. */
export function Avatar({ name, initials, color, src, size = 'md', square, className }: AvatarProps) {
  return (
    <span
      role="img"
      aria-label={name}
      className={clsx(
        'inline-flex shrink-0 items-center justify-center overflow-hidden leading-none font-bold tracking-wide text-surface',
        square ? 'rounded-r2' : 'rounded-full',
        !color && 'bg-info',
        SIZES[size],
        className,
      )}
      style={color ? { backgroundColor: color } : undefined}
    >
      {src ? <img src={src} alt="" loading="lazy" className="size-full object-cover" /> : initials ?? initialsOf(name)}
    </span>
  )
}
