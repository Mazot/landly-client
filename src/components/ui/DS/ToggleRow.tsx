import type { ReactNode } from 'react'
import { Switch, type SwitchProps } from './Switch'

export interface ToggleRowProps extends Omit<SwitchProps, 'label'> {
  title: string
  description?: ReactNode
  /** Accessible name of the switch; defaults to `title`. */
  switchLabel?: string
  /** Controls between the text and the switch (an opening day's times). */
  extra?: ReactNode
}

/**
 * Title + description + Switch — privacy settings, opening days (with their times in `extra`, which
 * wraps under the title on phones). Put several in `<List variant="divided">`.
 */
export function ToggleRow({ title, description, switchLabel, extra, ...switchProps }: ToggleRowProps) {
  return (
    <div className="flex min-h-14 flex-wrap items-center gap-x-3 px-4 py-1.5">
      <div className="min-w-0 flex-1 py-1.5">
        <div className="text-sm leading-tight font-bold text-ink-1">{title}</div>
        {description && <div className="mt-0.75 text-label font-medium text-ink-3">{description}</div>}
      </div>
      {/* Phones: under the title, full width (two time fields beside the switch do not fit 320 px). */}
      {extra && <div className="order-last flex w-full min-w-0 items-center gap-1.5 pb-2 sm:order-none sm:w-auto sm:shrink-0 sm:pb-0">{extra}</div>}
      <Switch label={switchLabel ?? title} {...switchProps} />
    </div>
  )
}
