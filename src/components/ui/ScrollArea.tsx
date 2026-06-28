/**
 * ScrollArea — flex-1 overflow-y-auto content zone.
 *
 * Replaces the repeated pattern:
 *   <div className="l-scroll" style={{ flex:1, overflowY:'auto', padding:... }}>
 */
import type { CSSProperties, ReactNode } from 'react'

interface ScrollAreaProps {
  /** CSS padding shorthand e.g. '16px' or '16px 16px 24px'. */
  padding?: string | number
  children: ReactNode
  style?: CSSProperties
  className?: string
}

export default function ScrollArea({ padding, children, style, className }: ScrollAreaProps) {
  return (
    <div
      className={`l-scroll${className ? ` ${className}` : ''}`}
      style={{
        flex: 1,
        overflowY: 'auto',
        ...(padding !== undefined ? { padding } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  )
}
