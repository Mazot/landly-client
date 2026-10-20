import clsx from 'clsx'
import { ICON_PATHS, type IconName } from './iconPaths'

export type { IconName }

export interface IconProps {
  name: IconName
  /** px; the 24-unit artwork scales to it. */
  size?: number
  strokeWidth?: number
  /** Fill the shape with the current colour (active bookmark, filled star). */
  filled?: boolean
  /** Accessible name; without it the icon is decorative (`aria-hidden`). */
  label?: string
  className?: string
}

/** Landly line icons (24 px grid, 1.6 stroke). Colour comes from `currentColor`. */
export function Icon({ name, size = 18, strokeWidth = 1.6, filled, label, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={clsx('shrink-0', className)}
    >
      {ICON_PATHS[name]}
    </svg>
  )
}
