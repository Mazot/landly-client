/* Flag + country-name pill (driven by server country data). */
import type { CSSProperties } from 'react'

interface CountryPillProps {
  flag?: string | null
  name?: string | null
  size?: 'sm' | 'md'
  style?: CSSProperties
}

export default function CountryPill({ flag, name, size = 'md', style }: CountryPillProps) {
  const h = size === 'sm' ? 26 : 30
  return (
    <span
      className="inline-flex items-center"
      style={{
        gap: 7,
        height: h,
        padding: '0 12px 0 8px',
        borderRadius: 999,
        background: 'var(--surface)',
        border: '1px solid var(--border-1)',
        font: '600 13px/1 var(--font-sans)',
        color: 'var(--ink-1)',
        ...style,
      }}
    >
      <span style={{ fontSize: size === 'sm' ? 14 : 16, lineHeight: 1 }}>{flag || '🏳️'}</span>
      <span>{name || '—'}</span>
    </span>
  )
}
