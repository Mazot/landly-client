/* Labelled text input over the `l-label` + `l-input` style system. */
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function TextField({ label, className, ...rest }: TextFieldProps) {
  return (
    <label className="block">
      {label && <span className="l-label">{label}</span>}
      <input className={cn('l-input', className)} {...rest} />
    </label>
  )
}
