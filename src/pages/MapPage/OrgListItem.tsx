import { useTranslation } from 'react-i18next'
import { useSavedStore } from '@/stores/savedStore'
import type { DisplayOrg } from '@/lib/displayOrg'
import Avatar from '@/components/ui/Avatar'
import TypeChip from '@/components/ui/TypeChip'
import Icon from '@/components/ui/Icon'

function savedEntryOf(o: DisplayOrg) {
  return {
    kind: 'org' as const,
    id: o.id,
    name: o.name,
    typeKey: o.typeKey,
    typeLabel: o.typeLabel,
    typeColor: o.typeColor,
    city: o.countryName,
    initials: o.initials,
  }
}

interface OrgListItemProps {
  org: DisplayOrg
  active: boolean
  compact?: boolean
  onSelect: () => void
}

export default function OrgListItem({ org, active, compact, onSelect }: OrgListItemProps) {
  const { t } = useTranslation()
  const { isSaved, toggle } = useSavedStore()
  const saved = isSaved(org.id)
  return (
    <div
      onClick={onSelect}
      className="flex items-center"
      style={{
        padding: compact ? '10px 12px' : 14,
        gap: compact ? 12 : 14,
        background: active ? 'var(--surface)' : 'transparent',
        border: active ? '1px solid var(--ink-1)' : compact ? '1px solid transparent' : '1px solid transparent',
        borderBottom: compact ? '1px solid var(--border-1)' : undefined,
        borderRadius: compact ? 12 : 14,
        cursor: 'pointer',
        boxShadow: active && !compact ? 'var(--shadow-2)' : 'none',
        marginBottom: compact ? 4 : 0,
      }}
    >
      <Avatar initials={org.initials} color={org.typeColor} size={compact ? 44 : 48} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center" style={{ gap: 5 }}>
          <span style={{ font: `600 ${compact ? 14 : 14.5}px/1.2 var(--font-sans)`, color: 'var(--ink-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {org.name}
          </span>
        </div>
        <div className="flex items-center" style={{ gap: 6, marginTop: 5 }}>
          <TypeChip type={org.typeKey} label={org.typeLabel} soft />
          {org.countryName && (
            <span style={{ font: '500 12px/1 var(--font-sans)', color: 'var(--ink-3)' }}>· {org.countryName}</span>
          )}
        </div>
        {!compact && org.address && (
          <div className="flex items-center" style={{ marginTop: 9, gap: 8, font: '500 12px/1.4 var(--font-sans)', color: 'var(--ink-3)' }}>
            <Icon name="pin" size={12} /> {org.address}
          </div>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); toggle(savedEntryOf(org)) }}
        style={{
          background: 'transparent', border: 0,
          color: saved ? 'var(--accent)' : 'var(--ink-4)',
          cursor: 'pointer', padding: 4,
          minWidth: 44, minHeight: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label={t('orgCompact.save')}
      >
        <Icon name="bookmark" size={16} />
      </button>
    </div>
  )
}
