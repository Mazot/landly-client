import clsx from 'clsx'
import type { ComponentProps } from 'react'
import { Icon, type IconName } from './Icon'
import { FOCUS_RING } from './lib/classes'

export type IconButtonVariant = 'plain' | 'outline' | 'floating'
export type IconButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<IconButtonVariant, string> = {
  plain: 'rounded-full hover:bg-surface-2',
  outline: 'rounded-full border-border-1 bg-surface-2 hover:bg-bg',
  floating: 'rounded-r3 bg-surface shadow-2',
}
const SIZES: Record<IconButtonSize, string> = { sm: 'size-11 lg:size-8', md: 'size-11 lg:size-9', lg: 'size-11.5' }
const ICON_SIZE: Record<IconButtonSize, number> = { sm: 15, md: 17, lg: 20 }

export interface IconButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  icon: IconName
  /** Required: accessible name and tooltip. */
  label: string
  variant?: IconButtonVariant
  size?: IconButtonSize
  /** Toggle state (bookmark): filled accent icon + `aria-pressed`. */
  pressed?: boolean
}

/** Round icon-only button: header back/close, sheet close, floating map controls, toggles. */
export function IconButton({ icon, label, variant = 'plain', size = 'md', pressed, type = 'button', className, ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={clsx(
        'inline-flex shrink-0 touch-manipulation items-center justify-center border border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-45',
        FOCUS_RING,
        VARIANTS[variant],
        SIZES[size],
        pressed ? 'text-accent' : 'text-ink-1',
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={ICON_SIZE[size]} filled={pressed} />
    </button>
  )
}
