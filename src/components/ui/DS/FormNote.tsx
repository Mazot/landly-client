import clsx from 'clsx'
import type { ReactNode } from 'react'

/** Centred secondary line under a form: "New to Landly? Create an account", "or continue as guest". */
export function FormNote({ size = 'md', children }: { size?: 'md' | 'sm'; children: ReactNode }) {
  return <p className={clsx('m-0 text-center font-medium text-ink-3', size === 'md' ? 'text-sm' : 'text-label')}>{children}</p>
}
