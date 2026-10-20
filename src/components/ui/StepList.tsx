import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

export interface Step {
  title: ReactNode
  description?: ReactNode
  icon?: IconName
  state?: 'done' | 'current' | 'todo'
  trailing?: ReactNode
}

const MARKER = {
  done: 'border-ink-1 bg-ink-1 text-surface',
  current: 'border-accent bg-accent text-surface',
  todo: 'border-border-1 bg-surface-2 text-ink-3',
} as const

/** Vertical process steps: "Sent for review", claim "What happens next". */
export function StepList({ items, numbered, card = true, className }: { items: Step[]; numbered?: boolean; card?: boolean; className?: string }) {
  return (
    <ol className={clsx('m-0 list-none divide-y divide-border-1 p-0', card && 'rounded-r3 border border-border-1 bg-surface px-4.5 py-1 shadow-1', className)}>
      {items.map((step, i) => {
        const state = step.state ?? 'todo'
        return (
          <li key={i} aria-current={state === 'current' ? 'step' : undefined} className="flex items-start gap-3.5 py-3.5">
            <span className={clsx('flex size-7.5 shrink-0 items-center justify-center rounded-full border text-xs leading-none font-bold', MARKER[state])}>
              {numbered ? i + 1 : <Icon name={state === 'done' ? 'check' : (step.icon ?? 'check')} size={14} strokeWidth={2} />}
            </span>
            <div className="min-w-0 flex-1 pt-1.5">
              <div className="text-sm leading-tight font-bold text-ink-1">{step.title}</div>
              {step.description && <div className="mt-0.75 text-label font-medium text-ink-3">{step.description}</div>}
            </div>
            {step.trailing && <div className="shrink-0 self-center">{step.trailing}</div>}
          </li>
        )
      })}
    </ol>
  )
}
