import clsx from 'clsx'
import { Link } from 'react-router-dom'
import type { To } from 'react-router-dom'
import { FOCUS_RING } from './lib/classes'

const SIZES = { sm: { mark: 24, text: 'text-xl' }, md: { mark: 28, text: 'text-2xl' } } as const

export interface LogoProps {
  size?: keyof typeof SIZES
  /** `mark` — the round symbol only (the name stays as its accessible label). */
  variant?: 'full' | 'mark'
  /** Makes the logo a router link (home). */
  to?: To
  className?: string
}

/** Landly mark + serif wordmark. */
export function Logo({ size = 'md', variant = 'full', to, className }: LogoProps) {
  const { mark, text } = SIZES[size]
  const body = (
    <>
      <svg width={mark} height={mark} viewBox="0 0 32 32" aria-hidden className="shrink-0">
        <circle cx="16" cy="16" r="15" className="fill-ink-1" />
        <circle cx="16" cy="13" r="6.5" fill="none" strokeWidth="1.6" className="stroke-bg" />
        <circle cx="16" cy="13" r="2.4" className="fill-accent" />
        <path d="M10 22.5 C 12 26, 20 26, 22 22.5" fill="none" strokeWidth="1.6" strokeLinecap="round" className="stroke-bg" />
      </svg>
      <span className={clsx(variant === 'full' ? clsx('font-display leading-none tracking-tight text-ink-1', text) : 'sr-only')}>landly</span>
    </>
  )
  const cls = clsx('inline-flex items-center gap-2.25', to !== undefined && ['min-h-11 touch-manipulation rounded-r1 lg:min-h-0', FOCUS_RING], className)
  return to !== undefined ? (
    <Link to={to} className={cls}>
      {body}
    </Link>
  ) : (
    <span className={cls}>{body}</span>
  )
}
