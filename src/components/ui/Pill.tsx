/* Typed pill primitive over the `l-pill` style system. */
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  accent?: boolean
}

export default function Pill({ active, accent, className, children, type = 'button', ...rest }: PillProps) {
  return (
    <button type={type} className={cn('l-pill', active && 'active', accent && 'accent', className)} {...rest}>
      {children}
    </button>
  )
}
