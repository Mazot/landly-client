import type { ReactNode } from 'react'
import { Switch, type SwitchProps } from './Switch'

export interface ToggleRowProps extends Omit<SwitchProps, 'label'> {
  title: string
  description?: ReactNode
}

/** Title + description + Switch — privacy settings, opening days. Put several in `<List variant="divided">`. */
export function ToggleRow({ title, description, ...switchProps }: ToggleRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-1.5">
      <div className="min-w-0 flex-1 py-1.5">
        <div className="text-sm leading-tight font-bold text-ink-1">{title}</div>
        {description && <div className="mt-0.75 text-label font-medium text-ink-3">{description}</div>}
      </div>
      <Switch label={title} {...switchProps} />
    </div>
  )
}
