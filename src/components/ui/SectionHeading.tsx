/* Eyebrow + display title, with an optional right-aligned aside. */
import type { ReactNode } from 'react'

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  aside?: ReactNode
}

export default function SectionHeading({ eyebrow, title, aside }: SectionHeadingProps) {
  return (
    <div className="flex justify-between" style={{ alignItems: 'baseline' }}>
      <div>
        {eyebrow && <div className="l-label" style={{ margin: 0 }}>{eyebrow}</div>}
        <h2 className="l-display" style={{ fontSize: 34, margin: '8px 0 0 0', fontWeight: 400 }}>{title}</h2>
      </div>
      {aside}
    </div>
  )
}
