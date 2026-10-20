import clsx from 'clsx'
import type { ComponentProps } from 'react'
import { Icon, type IconName } from './Icon'
import { FOCUS_RING } from './lib/classes'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'success' | 'danger' | 'whatsapp'
export type ButtonSize = 'sm' | 'md' | 'lg'

// Each variant sets its own border colour: two border-colour utilities on one element
// resolve by CSS order, not class order, so the base must not set one.
const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-ink-1 text-surface hover:bg-ink-2',
  accent: 'border-transparent bg-accent text-surface hover:bg-accent-hover',
  secondary: 'border-border-2 bg-surface text-ink-1 hover:bg-surface-2',
  ghost: 'border-transparent bg-transparent text-ink-1 hover:bg-surface-2',
  success: 'border-transparent bg-success text-surface hover:bg-success-hover',
  danger: 'border-border-2 bg-surface text-danger hover:bg-danger-soft',
  whatsapp: 'border-transparent bg-whatsapp text-surface hover:bg-whatsapp-hover',
}
// Phones get a 44 px hit area for every size; `sm` shrinks to 36 px from `lg`.
const SIZES: Record<ButtonSize, string> = {
  sm: 'h-11 gap-1.5 px-3.5 text-label lg:h-9',
  md: 'h-11 gap-2 px-4.5 text-sm',
  lg: 'h-13 gap-2 px-5.5 text-md',
}
const ICON_ONLY: Record<ButtonSize, string> = { sm: 'w-11 lg:w-9', md: 'w-11', lg: 'w-13' }
const ICON_SIZE: Record<ButtonSize, number> = { sm: 14, md: 15, lg: 16 }

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: IconName
  iconRight?: IconName
  /** Full width (inside a Sheet footer it takes the remaining space). */
  block?: boolean
  /** Shows a spinner and disables the button. */
  loading?: boolean
}

/** Every button in the product. No children → square icon button (give it `aria-label`). */
export function Button({ variant = 'primary', size = 'md', icon, iconRight, block, loading, disabled, type = 'button', className, children, ...rest }: ButtonProps) {
  const iconSize = ICON_SIZE[size]
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={clsx(
        'inline-flex shrink-0 touch-manipulation items-center justify-center rounded-r2 border leading-none font-semibold whitespace-nowrap transition-colors active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 disabled:active:translate-y-0',
        FOCUS_RING,
        VARIANTS[variant],
        SIZES[size],
        !children && ['px-0', ICON_ONLY[size]],
        block && 'w-full flex-1',
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner size={size === 'lg' ? 'lg' : 'md'} /> : icon && <Icon name={icon} size={iconSize} strokeWidth={1.8} />}
      {children}
      {iconRight && !loading && <Icon name={iconRight} size={iconSize} strokeWidth={1.8} />}
    </button>
  )
}
