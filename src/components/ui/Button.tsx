/* Typed button primitive over the `l-btn` style system. Polymorphic: renders an
 * <a> when `href` is provided, otherwise a <button>. Icons stay as children so
 * their size/stroke remain per-call. */
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'accent' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface CommonProps {
  variant?: Variant
  size?: Size
  /** Square icon-only button (`l-btn icon`). */
  iconButton?: boolean
  fullWidth?: boolean
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

type ButtonProps =
  | (CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined })
  | (CommonProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & { href: string })

function buildClass(variant: Variant, size: Size, iconButton?: boolean, extra?: string) {
  return cn(
    'l-btn',
    variant === 'accent' && 'accent',
    variant === 'ghost' && 'ghost',
    size === 'sm' && 'sm',
    size === 'lg' && 'lg',
    iconButton && 'icon',
    extra
  )
}

export default function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', iconButton, fullWidth, className, style, children, ...rest } = props
  const cls = buildClass(variant, size, iconButton, className)
  const mergedStyle = fullWidth ? { width: '100%', ...style } : style

  if (typeof props.href === 'string') {
    const anchorRest = rest as AnchorHTMLAttributes<HTMLAnchorElement>
    return (
      <a className={cls} style={mergedStyle} {...anchorRest}>
        {children}
      </a>
    )
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button className={cls} style={mergedStyle} {...buttonRest}>
      {children}
    </button>
  )
}
