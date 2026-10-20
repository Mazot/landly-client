import clsx from 'clsx'
import type { ComponentProps } from 'react'
import { FIELD_BOX, FIELD_CONTROL, FIELD_ERROR, FIELD_VARIANTS } from './lib/classes'
import { useField } from './lib/internal'

export interface TextAreaProps extends ComponentProps<'textarea'> {
  invalid?: boolean
}

/** Multi-line input with the same box, focus and error states as TextField. */
export function TextArea({ rows = 3, invalid, id, className, ...rest }: TextAreaProps) {
  const field = useField()
  const bad = invalid ?? field?.invalid
  return (
    <div className={clsx(FIELD_BOX, FIELD_VARIANTS.default, 'items-start px-3.5 py-3', bad && FIELD_ERROR, className)}>
      <textarea
        rows={rows}
        id={id ?? field?.id}
        aria-invalid={bad || undefined}
        aria-describedby={field?.describedBy}
        className={clsx(FIELD_CONTROL, 'resize-y leading-relaxed')}
        {...rest}
      />
    </div>
  )
}
