import clsx from 'clsx'
import type { ComponentProps, ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import { FIELD_BOX, FIELD_CONTROL, FIELD_ERROR, FIELD_SIZES, FIELD_VARIANTS } from './lib/classes'
import { useField } from './lib/internal'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<ComponentProps<'select'>, 'size' | 'children'> {
  options: SelectOption[]
  /** Empty, non-selectable first option; selected while there is no value. */
  placeholder?: string
  icon?: IconName
  leading?: ReactNode
  size?: 'md' | 'sm'
  invalid?: boolean
}

/** Native `<select>` styled as a field — accessible, system picker on phones. */
export function Select({ options, placeholder, icon, leading, size = 'md', invalid, id, value, defaultValue, className, ...rest }: SelectProps) {
  const field = useField()
  const bad = invalid ?? field?.invalid
  const initial = value === undefined && defaultValue === undefined && placeholder ? '' : defaultValue
  return (
    <div className={clsx(FIELD_BOX, FIELD_SIZES[size], FIELD_VARIANTS.default, bad && FIELD_ERROR, className)}>
      {(leading ?? icon) && <span className="flex shrink-0 text-ink-3">{leading ?? (icon && <Icon name={icon} size={16} />)}</span>}
      <select
        id={id ?? field?.id}
        value={value}
        defaultValue={initial}
        aria-invalid={bad || undefined}
        aria-describedby={field?.describedBy}
        className={clsx(FIELD_CONTROL, 'cursor-pointer pr-6')}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-3.5 flex -translate-y-1/2 text-ink-3">
        <Icon name="chevronDown" size={15} />
      </span>
    </div>
  )
}
