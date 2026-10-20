import clsx from 'clsx'
import { useState, type ComponentProps, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { UI_NS } from './i18n'
import { Icon, type IconName } from './Icon'
import { FIELD_BOX, FIELD_CONTROL, FIELD_ERROR, FIELD_SIZES, FIELD_VARIANTS, FOCUS_RING } from './lib/classes'
import { useField } from './lib/internal'

export interface TextFieldProps extends Omit<ComponentProps<'input'>, 'size'> {
  icon?: IconName
  /** Custom element on the left (flag emoji). */
  leading?: ReactNode
  /** Custom element on the right. */
  trailing?: ReactNode
  /** Muted text on the right, e.g. "WhatsApp". */
  addon?: string
  /** 46 / 40 px. */
  size?: 'md' | 'sm'
  /** `filled` — search in panels; `floating` — over the map. */
  variant?: keyof typeof FIELD_VARIANTS
  /** Defaults to the surrounding Field's error state. */
  invalid?: boolean
}

/** Single-line input. `type="password"` adds a show/hide button. */
export function TextField({ icon, leading, trailing, addon, size = 'md', variant = 'default', invalid, type = 'text', id, disabled, className, ...rest }: TextFieldProps) {
  const { t } = useTranslation(UI_NS)
  const field = useField()
  const [shown, setShown] = useState(false)
  const bad = invalid ?? field?.invalid
  const password = type === 'password'
  return (
    <div className={clsx(FIELD_BOX, FIELD_SIZES[size], FIELD_VARIANTS[variant], bad && FIELD_ERROR, disabled && 'opacity-70', className)}>
      {(leading ?? icon) && <span className="flex shrink-0 text-ink-3">{leading ?? (icon && <Icon name={icon} size={16} />)}</span>}
      <input
        type={password && shown ? 'text' : type}
        id={id ?? field?.id}
        disabled={disabled}
        aria-invalid={bad || undefined}
        aria-describedby={field?.describedBy}
        className={FIELD_CONTROL}
        {...rest}
      />
      {addon && <span className="shrink-0 text-xs font-semibold text-ink-3">{addon}</span>}
      {password && (
        <button
          type="button"
          onClick={() => setShown(!shown)}
          aria-label={shown ? t('hidePassword') : t('showPassword')}
          className={clsx('-mr-3 inline-flex size-11 shrink-0 touch-manipulation items-center justify-center rounded-r2 text-ink-3 hover:text-ink-1 lg:-mr-1.5 lg:size-7', FOCUS_RING)}
        >
          <Icon name={shown ? 'eyeOff' : 'eye'} size={16} />
        </button>
      )}
      {trailing}
    </div>
  )
}
