/* Small uppercase status badge (Active / Corridor / Person / Optional …). */
import type { ReactNode } from 'react'

interface BadgeProps {
  tone?: 'accent' | 'muted'
  /** Text colour override for the `muted` tone. */
  color?: string
  children: ReactNode
}

export default function Badge({ tone = 'muted', color, children }: BadgeProps) {
  const accent = tone === 'accent'
  return (
    <span
      className="inline-flex items-center"
      style={{
        gap: 5,
        padding: '4px 8px',
        borderRadius: 999,
        font: '600 10px/1 var(--font-sans)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: accent ? 'var(--accent-hover)' : color ?? 'var(--ink-3)',
        background: accent ? 'var(--accent-tint)' : 'var(--surface-2)',
        border: accent ? '1px solid transparent' : '1px solid var(--border-1)',
      }}
    >
      {children}
    </span>
  )
}
