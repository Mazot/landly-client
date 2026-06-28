/**
 * StickySection — non-scrolling header zone that sits between TopBar and ScrollArea.
 *
 * Use for anything that must stay visible while body content scrolls:
 * profile strips, stat rows, tab bars, filter bars.
 */
import type { CSSProperties, ReactNode } from 'react'

interface StickySectionProps {
  children: ReactNode
  /** Override surface/border defaults when needed (e.g. transparent for map overlays). */
  style?: CSSProperties
}

export default function StickySection({ children, style }: StickySectionProps) {
  return (
    <div
      style={{
        flexShrink: 0,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border-1)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
