/* Decorative org hero cover — type-coloured gradient + skyline silhouette. */
import type { ReactNode } from 'react'

interface OrgHeroCoverProps {
  /** Base colour (org type colour). */
  color: string
  height: number
  rounded?: boolean
  children?: ReactNode
}

export default function OrgHeroCover({ color, height, rounded = false, children }: OrgHeroCoverProps) {
  return (
    <div
      style={{
        height,
        borderRadius: rounded ? 16 : 0,
        overflow: 'hidden',
        position: 'relative',
        background: `linear-gradient(135deg, ${color} 0%, ${color}AA 55%, ${color}33 100%)`,
      }}
    >
      <svg viewBox="0 0 600 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
        <circle cx="500" cy="56" r="34" fill="#F4D7C9" opacity="0.6" />
        <g fill="rgba(27,26,23,0.22)">
          <rect x="120" y="90" width="170" height="150" />
          <rect x="160" y="56" width="90" height="184" />
          <rect x="300" y="120" width="150" height="120" />
        </g>
      </svg>
      {children}
    </div>
  )
}
