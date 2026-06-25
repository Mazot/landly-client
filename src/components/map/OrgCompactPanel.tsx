/* Compact org quick-view panel (520px slide-in, left of the map). */
import { useTranslation } from 'react-i18next'
import type { DisplayOrg } from '@/lib/displayOrg'
import { useSavedStore } from '@/stores/savedStore'
import TypeChip from '@/components/ui/TypeChip'
import Icon from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import InfoRow from '@/components/ui/InfoRow'
import OrgHeroCover from '@/components/ui/OrgHeroCover'

function CompactRow({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return (
    <InfoRow icon={icon} size={28} padding="7px 0">{children}</InfoRow>
  )
}

interface OrgCompactPanelProps {
  org: DisplayOrg
  onBack: () => void
  onOpenFull: () => void
}

export default function OrgCompactPanel({ org, onBack, onOpenFull }: OrgCompactPanelProps) {
  const { t } = useTranslation()
  const { isSaved, toggle } = useSavedStore()
  const saved = isSaved(org.id)
  const hex = org.typeColor

  return (
    <div
      className="l-scroll flex flex-col"
      style={{ overflow: 'auto', background: 'var(--surface)', borderRight: '1px solid var(--border-1)', height: '100%' }}
    >
      {/* sticky header */}
      <div
        className="flex items-center"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          background: 'var(--surface)',
          padding: '14px 20px',
          gap: 8,
          borderBottom: '1px solid var(--border-1)',
        }}
      >
        <Button variant="ghost" size="sm" iconButton style={{ width: 36, height: 36 }} onClick={onBack} aria-label={t('orgCompact.backToResults')}>
          <Icon name="arrowLeft" size={16} />
        </Button>
        <div style={{ font: '500 13px/1 var(--font-sans)', color: 'var(--ink-3)' }}>{t('orgCompact.backToResults')}</div>
        <div style={{ flex: 1 }} />
        <Button
          variant="ghost"
          size="sm"
          iconButton
          style={{ width: 36, height: 36, color: saved ? 'var(--accent)' : undefined }}
          onClick={() =>
            toggle({ kind: 'org', id: org.id, name: org.name, typeKey: org.typeKey, typeLabel: org.typeLabel, typeColor: org.typeColor, city: org.countryName, initials: org.initials })
          }
          aria-label={t('orgCompact.save')}
        >
          <Icon name="bookmark" size={16} />
        </Button>
        <Button variant="ghost" size="sm" iconButton style={{ width: 36, height: 36 }} aria-label={t('orgCompact.copyLink')}>
          <Icon name="link" size={16} />
        </Button>
        <Button size="sm" style={{ marginLeft: 4 }} onClick={onOpenFull}>
          {t('orgCompact.openFullPage')} <Icon name="arrowRight" size={13} stroke={2} />
        </Button>
      </div>

      {/* hero */}
      <div style={{ margin: 20, marginBottom: 0, position: 'relative', cursor: 'pointer' }} onClick={onOpenFull}>
        <OrgHeroCover color={hex} height={180} rounded>
          <div
            className="inline-flex items-center"
            style={{ position: 'absolute', bottom: 12, right: 12, gap: 7, padding: '7px 12px', background: 'rgba(20,18,14,0.7)', color: '#fff', borderRadius: 999, font: '600 12px/1 var(--font-sans)' }}
          >
            <Icon name="zoomIn" size={13} /> {t('orgCompact.openFullPage')}
          </div>
        </OrgHeroCover>
      </div>

      {/* info */}
      <div style={{ padding: '18px 20px 0 20px' }}>
        <div className="flex items-center" style={{ gap: 7, marginBottom: 10 }}>
          <TypeChip type={org.typeKey} label={org.typeLabel} soft />
        </div>
        <h2 style={{ font: '600 25px/1.2 var(--font-sans)', margin: '0 0 6px 0' }}>{org.name}</h2>
        {org.address && <div style={{ font: '500 13.5px/1.4 var(--font-sans)', color: 'var(--ink-3)' }}>{org.address}</div>}

        <div className="flex" style={{ gap: 10, marginTop: 18 }}>
          {org.tel && (
            <Button href={`tel:${org.tel}`} style={{ flex: 1, textDecoration: 'none' }}>
              <Icon name="phone" size={14} /> {t('orgCompact.call')}
            </Button>
          )}
          <Button variant="ghost" style={{ flex: 1 }}><Icon name="pin" size={14} /> {t('orgCompact.directions')}</Button>
          {org.email && (
            <Button variant="ghost" iconButton style={{ width: 44 }} href={`mailto:${org.email}`} aria-label={t('orgCompact.email')}><Icon name="mail" size={15} /></Button>
          )}
        </div>
      </div>

      <div className="flex flex-col" style={{ padding: '20px', gap: 6 }}>
        {org.countryName && <CompactRow icon="pin">{org.countryName}</CompactRow>}
        {org.tel && <CompactRow icon="phone">{org.tel}</CompactRow>}
        {org.email && <CompactRow icon="mail">{org.email}</CompactRow>}
      </div>

      {org.description && (
        <div style={{ padding: '0 20px 20px 20px', font: '400 14px/1.6 var(--font-sans)', color: 'var(--ink-2)' }}>
          {org.description}
        </div>
      )}

      {/* footer */}
      <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid var(--border-1)', background: 'var(--surface-2)' }}>
        <div style={{ font: '500 12px/1.45 var(--font-sans)', color: 'var(--ink-3)', marginBottom: 12 }}>
          {t('orgCompact.quickViewNote')}
        </div>
        <Button variant="accent" fullWidth onClick={onOpenFull}>
          {t('orgCompact.openFullPage')} <Icon name="arrowRight" size={14} stroke={2} />
        </Button>
      </div>
    </div>
  )
}
