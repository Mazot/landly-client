import type { CSSProperties, ReactNode } from 'react'

interface DividerWithTextProps {
  children: ReactNode
  style?: CSSProperties
}

export default function DividerWithText({ children, style }: DividerWithTextProps) {
  return (
    <div className="flex items-center" style={{ gap: 14, ...style }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border-1)' }} />
      <span style={{ font: '500 12px/1 var(--font-sans)', color: 'var(--ink-3)', flexShrink: 0 }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--border-1)' }} />
    </div>
  )
}
