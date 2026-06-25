/* Icon-in-container + text row (contact / detail rows). */
import type { CSSProperties, ReactNode } from 'react'
import Icon, { type IconName } from './Icon'

interface InfoRowProps {
  icon: IconName
  /** Square size of the icon container. */
  size?: number
  padding?: CSSProperties['padding']
  children: ReactNode
}

export default function InfoRow({ icon, size = 30, padding, children }: InfoRowProps) {
  return (
    <div className="flex items-center" style={{ gap: 11, padding }}>
      <div
        className="flex items-center justify-center"
        style={{ width: size, height: size, borderRadius: 8, background: 'var(--surface-2)', color: 'var(--ink-2)', flexShrink: 0 }}
      >
        <Icon name={icon} size={14} />
      </div>
      <span style={{ font: '500 13.5px/1.3 var(--font-sans)', color: 'var(--ink-1)' }}>{children}</span>
    </div>
  )
}
