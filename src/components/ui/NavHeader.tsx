/**
 * NavHeader — compact navigation header for detail / thread pages.
 *
 * Layout: [back?] [leading?] [title + subtitle flex:1] [trailing?]
 *
 * Use for: MessageThreadPage, OrgDetail sticky bar, any page reached via navigation.
 * For large-display titled pages (Messages inbox) use PageHeader.
 */
import type { CSSProperties, ReactNode } from 'react'
import Button from './Button'
import Icon from './Icon'

interface NavHeaderProps {
  /** Show back button on the left. */
  onBack?: () => void
  /** Accessible label for the back button. */
  backLabel?: string
  /** Element between back button and title (e.g. Avatar). */
  leading?: ReactNode
  /** Main title — string or ReactNode. */
  title: ReactNode
  /** Small subtitle below the title. */
  subtitle?: ReactNode
  /** Right-side actions. */
  trailing?: ReactNode
  style?: CSSProperties
}

export default function NavHeader({
  onBack,
  backLabel = 'Back',
  leading,
  title,
  subtitle,
  trailing,
  style,
}: NavHeaderProps) {
  return (
    <div
      className="flex items-center"
      style={{
        padding: 14,
        gap: 10,
        flexShrink: 0,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border-1)',
        ...style,
      }}
    >
      {onBack && (
        <Button iconButton variant="ghost" size="sm" onClick={onBack} aria-label={backLabel}>
          <Icon name="arrowLeft" size={15} />
        </Button>
      )}

      {leading && <div style={{ flexShrink: 0 }}>{leading}</div>}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            font: '600 14.5px/1.2 var(--font-sans)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ font: '500 11px/1 var(--font-sans)', color: 'var(--ink-3)', marginTop: 4 }}>
            {subtitle}
          </div>
        )}
      </div>

      {trailing && <div style={{ flexShrink: 0 }}>{trailing}</div>}
    </div>
  )
}
