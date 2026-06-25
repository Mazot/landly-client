/* Saved (/saved) — user's saved orgs/people/countries/corridors, with sub-tabs by kind. */
import { useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useSavedStore, type SavedEntry } from '@/stores/savedStore'
import TopBar from '@/components/ui/TopBar'
import TypeChip from '@/components/ui/TypeChip'
import Avatar from '@/components/ui/Avatar'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import FlagPair from '@/components/ui/FlagPair'
import SectionHeading from '@/components/ui/SectionHeading'

type TabKey = 'all' | 'orgs' | 'people' | 'countries' | 'corridors'

const KindBadge = ({ color, children }: { color: string; children: ReactNode }) => (
  <Badge color={color}>{children}</Badge>
)

function BookmarkBtn({ onClick, alignStart }: { onClick: () => void; alignStart?: boolean }) {
  const { t } = useTranslation()
  return (
    <button
      onClick={onClick}
      style={{ background: 'transparent', border: 0, color: 'var(--accent)', cursor: 'pointer', alignSelf: alignStart ? 'flex-start' : undefined }}
      aria-label={t('saved.remove')}
    >
      <Icon name="bookmark" size={16} />
    </button>
  )
}

function SavedCard({ entry, onRemove }: { entry: SavedEntry; onRemove: () => void }) {
  const { t } = useTranslation()
  if (entry.kind === 'country') {
    return (
      <div className="l-card flex items-center" style={{ padding: 18, gap: 14 }}>
        <span style={{ fontSize: 38, lineHeight: 1 }}>{entry.flag || '🏳️'}</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            <span style={{ font: '600 15.5px/1.2 var(--font-sans)' }}>{entry.name}</span>
            <KindBadge color="var(--ink-3)">{t('saved.kind.country')}</KindBadge>
          </div>
        </div>
        <BookmarkBtn onClick={onRemove} />
      </div>
    )
  }
  if (entry.kind === 'corridor') {
    return (
      <div className="l-card flex items-center" style={{ padding: 18, gap: 14 }}>
        <FlagPair fromFlag={entry.fromFlag} toFlag={entry.toFlag} size={24} gap={7} arrowSize={14} arrowColor="var(--accent)" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            <span style={{ font: '600 15px/1.2 var(--font-sans)' }}>{entry.fromName} → {entry.toName}</span>
            <KindBadge color="var(--accent-hover)">{t('saved.kind.corridor')}</KindBadge>
          </div>
        </div>
        <BookmarkBtn onClick={onRemove} />
      </div>
    )
  }
  return (
    <div className="l-card flex" style={{ padding: 18, gap: 14 }}>
      <Avatar initials={entry.initials} color={entry.typeColor} size={48} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="flex items-center" style={{ gap: 6 }}>
          <span style={{ font: '600 14.5px/1.2 var(--font-sans)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.name}</span>
          {entry.kind === 'person' && <KindBadge color="var(--type-volunteer)">{t('saved.kind.person')}</KindBadge>}
        </div>
        <div className="flex items-center" style={{ gap: 8, marginTop: 8 }}>
          <TypeChip type={entry.typeKey} label={entry.typeLabel} soft />
          {(entry.role || entry.city) && (
            <span style={{ font: '500 12px/1 var(--font-sans)', color: 'var(--ink-3)' }}>· {entry.role ?? entry.city}</span>
          )}
        </div>
        {entry.note && (
          <div className="flex" style={{ marginTop: 10, font: '500 12.5px/1.45 var(--font-sans)', color: 'var(--ink-2)', background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 8, padding: '7px 10px', gap: 7, alignItems: 'flex-start' }}>
            <Icon name="edit" size={12} style={{ color: 'var(--ink-3)', marginTop: 1, flexShrink: 0 }} /> {entry.note}
          </div>
        )}
      </div>
      <BookmarkBtn onClick={onRemove} alignStart />
    </div>
  )
}

export default function SavedPage() {
  const { t } = useTranslation()
  const { items, remove } = useSavedStore()
  const [tab, setTab] = useState<TabKey>('all')

  const counts: Record<TabKey, number> = {
    all: items.length,
    orgs: items.filter((i) => i.kind === 'org').length,
    people: items.filter((i) => i.kind === 'person').length,
    countries: items.filter((i) => i.kind === 'country').length,
    corridors: items.filter((i) => i.kind === 'corridor').length,
  }
  const tabs: TabKey[] = ['all', 'orgs', 'people', 'countries', 'corridors']
  const matches = (e: SavedEntry) =>
    tab === 'all' ||
    (tab === 'orgs' && e.kind === 'org') ||
    (tab === 'people' && e.kind === 'person') ||
    (tab === 'countries' && e.kind === 'country') ||
    (tab === 'corridors' && e.kind === 'corridor')
  const filtered = items.filter(matches)

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      <TopBar />

      <div style={{ padding: '32px 56px 0 56px' }}>
        <div style={{ marginBottom: 22 }}>
          <SectionHeading eyebrow={t('saved.yourShortlist')} title={t('saved.title')} />
        </div>
        <div className="flex" style={{ gap: 6, borderBottom: '1px solid var(--border-1)' }}>
          {tabs.map((k) => {
            const on = k === tab
            return (
              <button
                key={k}
                onClick={() => setTab(k)}
                className="flex items-center"
                style={{ gap: 8, padding: '12px 4px', marginBottom: -1, cursor: 'pointer', background: 'transparent', border: 0, borderBottom: on ? '2px solid var(--ink-1)' : '2px solid transparent' }}
              >
                <span style={{ font: '600 14.5px/1 var(--font-sans)', color: on ? 'var(--ink-1)' : 'var(--ink-3)' }}>{t(`saved.tabs.${k}`)}</span>
                <span style={{ font: '600 11px/1 var(--font-sans)', color: on ? 'var(--ink-1)' : 'var(--ink-4)', background: on ? 'var(--surface-2)' : 'transparent', border: '1px solid var(--border-1)', borderRadius: 999, padding: '3px 7px' }}>{counts[k]}</span>
              </button>
            )
          })}
          <div style={{ flex: 1 }} />
          <Button variant="ghost" size="sm" style={{ alignSelf: 'center', marginBottom: 8 }}>
            <Icon name="plus" size={13} /> {t('saved.newList')}
          </Button>
        </div>
      </div>

      <div className="l-scroll" style={{ flex: 1, overflow: 'auto', padding: '22px 56px 56px 56px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', font: '500 14px/1.5 var(--font-sans)', color: 'var(--ink-3)' }}>
            {t('saved.empty')}
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {filtered.map((e) => (
              <SavedCard key={e.id} entry={e} onRemove={() => remove(e.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
