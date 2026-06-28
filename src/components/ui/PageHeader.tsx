/**
 * PageHeader — large-display page header (Messages-style).
 *
 * Shows a prominent title with an optional trailing action zone.
 * For nav-style headers with a back button use NavHeader instead.
 */
import type { CSSProperties, ReactNode } from 'react'

interface PageHeaderProps {
  /** Main heading text — rendered with l-display font. */
  title: string
  /** Right-side slot: icon buttons, CTAs. */
  trailing?: ReactNode
  style?: CSSProperties
}

export default function PageHeader({ title, trailing, style }: PageHeaderProps) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: '18px 16px 12px',
        flexShrink: 0,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border-1)',
        ...style,
      }}
    >
      <h2
        className="l-display"
        style={{ fontSize: 26, margin: 0, fontWeight: 400 }}
      >
        {title}
      </h2>
      {trailing && <div className="flex items-center" style={{ gap: 4 }}>{trailing}</div>}
    </div>
  )
}
