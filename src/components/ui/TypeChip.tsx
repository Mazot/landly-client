/* Org-type chip — soft (colour-filled) or default (white + border) variant. */
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { TYPE_META, type OrgTypeKey } from '@/lib/orgTypes'

interface TypeChipProps {
  type: OrgTypeKey
  /** Overrides the i18n label (e.g. a server-provided org-type title). */
  label?: string
  withDot?: boolean
  soft?: boolean
  style?: CSSProperties
}

export default function TypeChip({ type, label, withDot = true, soft = false, style }: TypeChipProps) {
  const { t } = useTranslation()
  const m = TYPE_META[type] ?? TYPE_META.business
  return (
    <span
      className="inline-flex items-center"
      style={{
        gap: 6,
        height: 24,
        padding: '0 10px',
        borderRadius: 999,
        background: soft ? m.soft : 'var(--surface)',
        border: soft ? '1px solid transparent' : '1px solid var(--border-1)',
        font: '600 11.5px/1 var(--font-sans)',
        color: soft ? m.dot : 'var(--ink-2)',
        letterSpacing: '0.01em',
        ...style,
      }}
    >
      {withDot && (
        <span style={{ width: 7, height: 7, borderRadius: 999, background: m.dot }} />
      )}
      {label ?? t(`orgType.${type}`)}
    </span>
  )
}
