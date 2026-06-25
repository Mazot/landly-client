/* Circular initials avatar. */
import type { CSSProperties } from 'react'

interface AvatarProps {
  initials?: string
  size?: number
  color?: string
  style?: CSSProperties
}

export default function Avatar({ initials = 'AB', size = 36, color = '#D97757', style }: AvatarProps) {
  return (
    <div
      className="inline-flex items-center justify-center text-white"
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: color,
        font: `700 ${size * 0.36}px/1 var(--font-sans)`,
        letterSpacing: '0.02em',
        flexShrink: 0,
        ...style,
      }}
    >
      {initials}
    </div>
  )
}
