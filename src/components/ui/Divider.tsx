import type { CSSProperties } from 'react'

interface DividerProps {
  spacing?: number
  style?: CSSProperties
  className?: string
}

export default function Divider({ spacing = 0, style, className }: DividerProps) {
  return (
    <div
      className={className}
      style={{ height: 1, background: 'var(--border-1)', margin: spacing ? `${spacing}px 0` : 0, ...style }}
    />
  )
}
