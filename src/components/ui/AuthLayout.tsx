import type { ReactNode } from 'react'
import { Logo } from './Logo'
import { MapBackdrop } from './MapBackdrop'

export interface AuthLayoutProps {
  /** Hero copy shown at the bottom of the map panel from `lg` (a `PageHeader`). */
  aside?: ReactNode
  /** Where the logo links to. */
  home?: string
  children: ReactNode
}

/**
 * Frame of sign-in / sign-up: plain page on phones, form card on the map from `md`,
 * map panel + form column from `lg`.
 */
export function AuthLayout({ aside, home = '/', children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-surface md:bg-country-water lg:flex-row lg:bg-surface">
      <MapBackdrop className="absolute inset-0 hidden opacity-70 md:block lg:hidden" />
      <aside className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-country-water p-11 lg:flex">
        <MapBackdrop className="absolute inset-0" />
        <Logo to={home} className="relative self-start" />
        {aside && <div className="relative max-w-xl">{aside}</div>}
      </aside>
      <main className="relative flex flex-1 flex-col md:items-center md:justify-center md:p-10 lg:w-160 lg:flex-none lg:p-15">
        <div className="w-full px-5.5 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-8 md:max-w-130 md:rounded-r4 md:bg-surface md:p-10 md:shadow-pop lg:max-w-110 lg:bg-transparent lg:p-0 lg:shadow-none">
          <Logo to={home} className="mb-5.5 md:mb-7 lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  )
}
