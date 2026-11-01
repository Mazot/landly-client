import clsx from 'clsx'
import type { ReactNode } from 'react'

export interface KeyValueItem {
  label: ReactNode
  value: ReactNode
  /** Monospace value (codes, tokens). */
  mono?: boolean
}

/** Label → value rows: country facts, submitted details, account email. */
export function KeyValueList({ items, card = true, className }: { items: KeyValueItem[]; card?: boolean; className?: string }) {
  return (
    <dl className={clsx('m-0 divide-y divide-border-1', card && 'rounded-r3 border border-border-1 bg-surface px-4.5 py-1.5 shadow-1', className)}>
      {items.map((item, i) => (
        <div key={i} className="flex justify-between gap-3 py-2.25 text-label">
          <dt className="font-medium text-ink-3">{item.label}</dt>
          <dd className={clsx('m-0 text-right text-ink-1', item.mono ? 'font-mono font-medium' : 'font-semibold')}>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
