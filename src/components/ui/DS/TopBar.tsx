import clsx from 'clsx'
import type { ReactNode } from 'react'

export interface TopBarProps {
  /** Usually `<Logo to="/" />`. */
  brand: ReactNode
  /** Navigation (`NavTabs`); shown from `md`. */
  nav?: ReactNode
  /** Right side: language, sign-in / sign-up buttons or the account menu. */
  actions?: ReactNode
  className?: string
}

/** Page banner of public and signed-in screens, safe-area aware; phones keep brand + actions only. */
export function TopBar({ brand, nav, actions, className }: TopBarProps) {
  return (
    <header className={clsx('flex min-h-14 shrink-0 items-center gap-3 border-b border-border-1 bg-surface/92 px-5 pt-[env(safe-area-inset-top)] md:min-h-16 md:gap-4 md:px-6', className)}>
      {brand}
      {nav && <div className="hidden md:block">{nav}</div>}
      <div className="ml-auto flex items-center gap-2">{actions}</div>
    </header>
  )
}
