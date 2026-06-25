/* Selectable pill chip — used for role/language/filter/country toggles. */
import type { CSSProperties, ReactNode } from 'react'
import Icon from './Icon'

interface ChipProps {
  active?: boolean
  /** Coloured dot before the label (e.g. org-type filters). */
  dot?: string
  /** Content before the label (e.g. a flag) — suppresses the active check. */
  leading?: ReactNode
  /** Show a check when active (ignored when `dot` or `leading` is set). */
  checkable?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
  style?: CSSProperties
  children: ReactNode
}

export default function Chip({
  active = false,
  dot,
  leading,
  checkable = true,
  onClick,
  type = 'button',
  style,
  children,
}: ChipProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center"
      style={{
        gap: 6,
        padding: '8px 13px',
        borderRadius: 999,
        background: active ? 'var(--ink-1)' : 'var(--surface)',
        color: active ? '#fff' : 'var(--ink-2)',
        border: active ? '1px solid var(--ink-1)' : '1px solid var(--border-1)',
        font: '600 13px/1 var(--font-sans)',
        cursor: 'pointer',
        ...style,
      }}
    >
      {dot && <span style={{ width: 8, height: 8, borderRadius: 999, background: dot }} />}
      {!dot && !leading && checkable && active && <Icon name="check" size={11} stroke={2.4} />}
      {leading}
      {children}
    </button>
  )
}
