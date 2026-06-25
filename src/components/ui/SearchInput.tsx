/* Text input with a leading search icon. */
import type { CSSProperties } from 'react'
import Icon from './Icon'

interface SearchInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  height?: number
  /** Style applied to the wrapper (e.g. width / flex). */
  style?: CSSProperties
}

export default function SearchInput({ value, onChange, placeholder, height = 40, style }: SearchInputProps) {
  return (
    <div className="relative" style={style}>
      <Icon name="search" size={16} style={{ position: 'absolute', left: 12, top: (height - 16) / 2, color: 'var(--ink-3)' }} />
      <input
        className="l-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        style={{ paddingLeft: 38, height, background: 'var(--surface-2)', border: '1px solid var(--border-1)' }}
      />
    </div>
  )
}
