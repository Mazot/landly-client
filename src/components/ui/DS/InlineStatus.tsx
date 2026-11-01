import type { ReactNode } from 'react'
import { Spinner } from './Spinner'

/** Spinner + short message announced as a status: "Signing you in…". */
export function InlineStatus({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="flex items-center gap-3 text-sm font-semibold text-ink-2">
      <Spinner />
      {children}
    </div>
  )
}
