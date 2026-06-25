/* "More filters" slide-in sheet — floats over the dimmed map. */
import { useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { TYPE_META, ADDED_BY_META, type OrgTypeKey } from '@/lib/orgTypes'
import { useToggleSet } from '@/hooks/useToggleSet'
import Icon from '@/components/ui/Icon'
import Chip from '@/components/ui/Chip'
import Button from '@/components/ui/Button'

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ padding: '18px 0', borderTop: '1px solid var(--border-1)' }}>
      <div className="l-label" style={{ marginBottom: 12 }}>{label}</div>
      {children}
    </div>
  )
}

/** Filter chip — taller fixed-height variant of the shared Chip. */
function FChip({ on, dot, onClick, children }: { on: boolean; dot?: string; onClick: () => void; children: ReactNode }) {
  return (
    <Chip active={on} dot={dot} onClick={onClick} style={{ height: 34, padding: '0 13px', gap: 7 }}>
      {children}
    </Chip>
  )
}

interface FiltersSheetProps {
  onClose: () => void
  onApply?: () => void
  /** Result count shown on the apply button. */
  count?: number
  /** Reference city/country for the distance group label. */
  city?: string
}

export default function FiltersSheet({ onClose, onApply, count = 0, city }: FiltersSheetProps) {
  const { t } = useTranslation()
  const { has, toggle, reset, size } = useToggleSet<string>([
    'type:community', 'type:helper', 'avail:open', 'lang:russian',
    'lang:english', 'trust:verified', 'cost:any',
  ])
  const [dist, setDist] = useState(25) // km, 0..50

  const pct = (dist / 50) * 100

  const types: OrgTypeKey[] = ['embassy', 'business', 'community', 'helper', 'volunteer']

  return (
    <div
      className="absolute flex flex-col"
      style={{
        top: 16,
        right: 16,
        bottom: 16,
        width: 400,
        background: 'var(--surface)',
        borderRadius: 18,
        boxShadow: 'var(--shadow-pop)',
        border: '1px solid var(--border-1)',
        overflow: 'hidden',
        zIndex: 30,
      }}
    >
      {/* header */}
      <div className="flex items-center" style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-1)' }}>
        <Icon name="sliders" size={18} style={{ color: 'var(--ink-1)' }} />
        <div style={{ font: '600 17px/1 var(--font-sans)', marginLeft: 10 }}>{t('filters.title')}</div>
        <span
          style={{
            marginLeft: 10,
            font: '600 12px/1 var(--font-sans)',
            color: 'var(--accent-hover)',
            background: 'var(--accent-tint)',
            padding: '4px 9px',
            borderRadius: 999,
          }}
        >
          {t('filters.activeCount', { count: size })}
        </span>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" size="sm" iconButton style={{ width: 34, height: 34 }} onClick={onClose} aria-label={t('filters.close')}>
          <Icon name="close" size={16} />
        </Button>
      </div>

      <div className="l-scroll" style={{ flex: 1, overflow: 'auto', padding: '4px 22px 16px 22px' }}>
        <FilterGroup label={t('filters.placeType')}>
          <div className="flex flex-wrap" style={{ gap: 7 }}>
            {types.map((type) => (
              <FChip key={type} on={has(`type:${type}`)} dot={TYPE_META[type].dot} onClick={() => toggle(`type:${type}`)}>
                {t(`orgType.${type}`)}
              </FChip>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup label={t('filters.availability')}>
          <div className="flex flex-wrap" style={{ gap: 7 }}>
            {[['avail:open', 'filters.openNow'], ['avail:weekends', 'filters.openWeekends'], ['avail:noappt', 'filters.noAppointment']].map(([k, lk]) => (
              <FChip key={k} on={has(k)} onClick={() => toggle(k)}>{t(lk)}</FChip>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup label={t('filters.languagesSpoken')}>
          <div className="flex flex-wrap" style={{ gap: 7 }}>
            {['russian', 'ukrainian', 'english', 'german', 'addMore'].map((l) => (
              <FChip key={l} on={has(`lang:${l}`)} onClick={() => toggle(`lang:${l}`)}>
                {l === 'addMore' ? t('filters.addMore') : t(`filters.lang.${l}`)}
              </FChip>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup label={t('filters.trust')}>
          <div className="flex flex-wrap" style={{ gap: 7 }}>
            <FChip on={has('trust:verified')} onClick={() => toggle('trust:verified')}>
              <Icon name="verified" size={13} /> {t('filters.verifiedOnly')}
            </FChip>
            <FChip on={has('trust:month')} onClick={() => toggle('trust:month')}>{t('filters.confirmedThisMonth')}</FChip>
            <FChip on={has('trust:rated')} onClick={() => toggle('trust:rated')}>{t('filters.rated')}</FChip>
          </div>
        </FilterGroup>

        <FilterGroup label={t('filters.addedBy')}>
          <div className="flex flex-wrap" style={{ gap: 7 }}>
            {(Object.entries(ADDED_BY_META)).map(([k, m]) => (
              <FChip key={k} on={has(`by:${k}`)} dot={m.color} onClick={() => toggle(`by:${k}`)}>{t(`addedBy.${k}`)}</FChip>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup label={t('filters.cost')}>
          <div className="flex flex-wrap" style={{ gap: 7 }}>
            {[['cost:free', 'filters.free'], ['cost:paid', 'filters.paidService'], ['cost:any', 'filters.any']].map(([k, lk]) => (
              <FChip key={k} on={has(k)} onClick={() => toggle(k)}>{t(lk)}</FChip>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup label={t('filters.distanceFrom', { city: city ?? '—' })}>
          <div className="relative flex items-center" style={{ height: 36 }}>
            <div style={{ height: 4, borderRadius: 2, background: 'var(--border-2)', width: '100%' }} />
            <div style={{ position: 'absolute', left: 0, height: 4, borderRadius: 2, background: 'var(--ink-1)', width: `${pct}%` }} />
            <div
              style={{
                position: 'absolute',
                left: `${pct}%`,
                width: 18,
                height: 18,
                borderRadius: 999,
                background: 'var(--surface)',
                border: '2px solid var(--ink-1)',
                transform: 'translateX(-50%)',
                boxShadow: 'var(--shadow-1)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="range"
              min={0}
              max={50}
              value={dist}
              onChange={(e) => setDist(Number(e.target.value))}
              aria-label="Distance"
              className="absolute inset-0 w-full cursor-pointer"
              style={{ opacity: 0, height: 36 }}
            />
          </div>
          <div className="flex justify-between" style={{ font: '500 12px/1 var(--font-sans)', color: 'var(--ink-3)' }}>
            <span>{t('filters.withinCity')}</span>
            <span style={{ color: 'var(--ink-1)', fontWeight: 600 }}>{t('filters.km', { km: dist })}</span>
            <span>{t('filters.wholeCountry')}</span>
          </div>
        </FilterGroup>
      </div>

      {/* footer */}
      <div className="flex items-center" style={{ padding: '14px 22px', borderTop: '1px solid var(--border-1)', gap: 12 }}>
        <Button variant="ghost" style={{ flex: '0 0 auto' }} onClick={reset}>{t('filters.reset')}</Button>
        <Button variant="accent" style={{ flex: 1 }} onClick={onApply ?? onClose}>{t('filters.showPlaces', { count })}</Button>
      </div>
    </div>
  )
}
