import clsx from 'clsx'
import type { ReactNode } from 'react'

/** Hairline separator; with `label` the text sits in the middle ("or with email"). */
export function Divider({ label, className }: { label?: ReactNode; className?: string }) {
  if (!label) return <hr className={clsx('h-px border-0 bg-border-1', className)} />
  return (
    <div
      role="separator"
      className={clsx('flex items-center gap-3 text-xs font-medium text-ink-4 before:h-px before:flex-1 before:bg-border-1 after:h-px after:flex-1 after:bg-border-1', className)}
    >
      {label}
    </div>
  )
}
