/* Map (/map) — primary screen. TopBar + filter strip + sidebar/compact panel + live map. */
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCorridor } from '@/hooks/useCorridor'
import { useDisplayOrgs, useDisplayOrg } from '@/hooks/useDisplayOrgs'
import { useSavedStore } from '@/stores/savedStore'
import type { DisplayOrg } from '@/lib/displayOrg'
import TopBar from '@/components/ui/TopBar'
import TypeChip from '@/components/ui/TypeChip'
import Avatar from '@/components/ui/Avatar'
import CorridorBubble from '@/components/ui/CorridorBubble'
import ColoredTypeRail, { type RailKey } from '@/components/ui/ColoredTypeRail'
import SearchInput from '@/components/ui/SearchInput'
import Button from '@/components/ui/Button'
import Pill from '@/components/ui/Pill'
import Icon from '@/components/ui/Icon'
import LandlyMap, { type MapMarker } from '@/components/map/LandlyMap'
import FiltersSheet from '@/components/map/FiltersSheet'
import OrgCompactPanel from '@/components/map/OrgCompactPanel'

const SORTS = ['nearest', 'recent', 'verified'] as const

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

function OrgListItem({ org, active, onSelect }: { org: DisplayOrg; active: boolean; onSelect: () => void }) {
  const { t } = useTranslation()
  const { isSaved, toggle } = useSavedStore()
  const saved = isSaved(org.id)
  return (
    <div
      onClick={onSelect}
      className="grid"
      style={{
        padding: 14,
        background: active ? 'var(--surface)' : 'transparent',
        border: active ? '1px solid var(--ink-1)' : '1px solid transparent',
        borderRadius: 14,
        gridTemplateColumns: '48px 1fr auto',
        gap: 14,
        cursor: 'pointer',
        boxShadow: active ? 'var(--shadow-2)' : 'none',
      }}
    >
      <Avatar initials={org.initials} color={org.typeColor} size={48} />
      <div style={{ minWidth: 0 }}>
        <div
          style={{ font: '600 14.5px/1.2 var(--font-sans)', color: 'var(--ink-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {org.name}
        </div>
        <div className="flex items-center" style={{ gap: 7, marginTop: 7 }}>
          <TypeChip type={org.typeKey} label={org.typeLabel} soft />
          {org.countryName && <span style={{ font: '500 12px/1 var(--font-sans)', color: 'var(--ink-3)' }}>· {org.countryName}</span>}
        </div>
        {org.address && (
          <div className="flex items-center" style={{ marginTop: 9, gap: 8, font: '500 12px/1.4 var(--font-sans)', color: 'var(--ink-3)' }}>
            <Icon name="pin" size={12} /> {org.address}
          </div>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggle(savedEntryOf(org))
        }}
        style={{ background: 'transparent', border: 0, color: saved ? 'var(--accent)' : 'var(--ink-4)', cursor: 'pointer' }}
        aria-label={t('orgCompact.save')}
      >
        <Icon name="bookmark" size={16} />
      </button>
    </div>
  )
}

function Sidebar({
  toName,
  items,
  total,
  isLoading,
  activeId,
  onSelect,
}: {
  toName: string
  items: DisplayOrg[]
  total: number
  isLoading: boolean
  activeId: string | null
  onSelect: (id: string) => void
}) {
  const { t } = useTranslation()
  const [sort, setSort] = useState<(typeof SORTS)[number]>('nearest')
  const [view, setView] = useState<'list' | 'grid'>('list')

  return (
    <div className="l-scroll" style={{ overflow: 'auto', borderRight: '1px solid var(--border-1)', background: 'var(--bg)' }}>
      <div className="flex justify-between" style={{ padding: '20px 24px 12px 24px', alignItems: 'flex-end' }}>
        <div>
          <div className="l-label" style={{ margin: 0 }}>{t('map.showingIn', { country: toName })}</div>
          <div style={{ font: '600 22px/1.2 var(--font-sans)', marginTop: 6 }}>{t('map.organizationsCount', { count: total })}</div>
        </div>
        <div className="flex" style={{ gap: 4, padding: 3, background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 8 }}>
          {(['list', 'grid'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="flex items-center justify-center"
              style={{
                width: 28,
                height: 24,
                border: 0,
                borderRadius: 5,
                background: view === v ? 'var(--surface)' : 'transparent',
                boxShadow: view === v ? 'var(--shadow-1)' : 'none',
                color: view === v ? 'var(--ink-1)' : 'var(--ink-3)',
                cursor: 'pointer',
              }}
              aria-label={t(v === 'list' ? 'map.listView' : 'map.gridView')}
            >
              <Icon name={v} size={14} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center" style={{ padding: '0 24px 16px 24px', gap: 8 }}>
        <span style={{ font: '500 12.5px/1 var(--font-sans)', color: 'var(--ink-3)' }}>{t('map.sortBy')}</span>
        {SORTS.map((s) => (
          <Pill key={s} active={sort === s} onClick={() => setSort(s)} style={{ height: 26, fontSize: 12, cursor: 'pointer' }}>
            {t(`map.sort.${s}`)}
          </Pill>
        ))}
      </div>

      <div className="flex flex-col" style={{ padding: '0 16px 24px 16px', gap: 8 }}>
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '24px 0', font: '500 13px/1 var(--font-sans)', color: 'var(--ink-3)' }}>
            {t('map.loading')}
          </div>
        )}
        {!isLoading && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', font: '500 13px/1 var(--font-sans)', color: 'var(--ink-3)' }}>
            {t('map.empty')}
          </div>
        )}
        {items.map((o) => (
          <OrgListItem key={o.id} org={o} active={o.id === activeId} onSelect={() => onSelect(o.id)} />
        ))}
      </div>
    </div>
  )
}

export default function MapPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { from, to, toId } = useCorridor()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeType, setActiveType] = useState<RailKey>('all')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [ruOnly, setRuOnly] = useState(false)
  const [verified, setVerified] = useState(false)
  const [search, setSearch] = useState('')

  const { items, total, isLoading } = useDisplayOrgs({
    location_country_id: toId ?? undefined,
    limit: 100,
  })

  const activeOrgId = searchParams.get('org')
  const { org: activeOrg } = useDisplayOrg(activeOrgId ?? '')

  const selectOrg = (id: string) => setSearchParams({ org: id })
  const clearOrg = () => setSearchParams({})

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter(
      (o) =>
        (activeType === 'all' || o.typeKey === activeType) &&
        (q === '' || o.name.toLowerCase().includes(q) || (o.countryName ?? '').toLowerCase().includes(q))
    )
  }, [items, activeType, search])

  const markers: MapMarker[] = useMemo(
    () => filtered.filter((o) => o.coord).map((o) => ({ id: o.id, coord: o.coord!, type: o.typeKey, name: o.name })),
    [filtered]
  )

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      <TopBar />

      {/* filter strip */}
      <div
        className="flex items-center"
        style={{ height: 60, padding: '0 20px', gap: 10, borderBottom: '1px solid var(--border-1)', background: 'var(--surface)' }}
      >
        <SearchInput value={search} onChange={setSearch} placeholder={t('map.searchPlaceholder')} style={{ flex: '0 1 320px' }} />
        <div style={{ width: 1, height: 24, background: 'var(--border-1)' }} />
        <div className="l-scroll" style={{ overflowX: 'auto' }}>
          <ColoredTypeRail active={activeType} onPick={setActiveType} />
        </div>
        <div style={{ flex: 1 }} />
        <Pill active={ruOnly} style={{ cursor: 'pointer' }} onClick={() => setRuOnly((v) => !v)}>
          <Icon name="languages" size={13} /> {t('map.russianSpeaking')}
        </Pill>
        <Pill active={verified} style={{ cursor: 'pointer' }} onClick={() => setVerified((v) => !v)}>
          <Icon name="verified" size={13} /> {t('map.verified')}
        </Pill>
        <Button variant="ghost" size="sm" onClick={() => setFiltersOpen(true)}>
          <Icon name="sliders" size={14} /> {t('map.moreFilters')}
        </Button>
      </div>

      {/* body */}
      <div className="grid" style={{ flex: 1, gridTemplateColumns: activeOrg ? '520px 1fr' : '440px 1fr', overflow: 'hidden' }}>
        {activeOrg ? (
          <OrgCompactPanel org={activeOrg} onBack={clearOrg} onOpenFull={() => navigate(`/org/${activeOrg.id}`)} />
        ) : (
          <Sidebar toName={to?.name ?? '—'} items={filtered} total={total} isLoading={isLoading} activeId={activeOrgId} onSelect={selectOrg} />
        )}

        <div className="relative" style={{ background: 'var(--country-water)', overflow: 'hidden' }}>
          <LandlyMap
            markers={markers}
            center={activeOrg?.coord}
            zoom={activeOrg ? 11 : 5}
            fitToMarkers={!activeOrg}
            activeId={activeOrgId}
            onMarkerClick={selectOrg}
          >
            <div className="absolute" style={{ top: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
              <button
                className="inline-flex items-center"
                style={{ padding: '9px 16px', background: 'var(--surface)', color: 'var(--ink-1)', border: '1px solid var(--border-1)', borderRadius: 999, font: '600 13px/1 var(--font-sans)', boxShadow: 'var(--shadow-2)', gap: 8, cursor: 'pointer' }}
              >
                <Icon name="search" size={14} /> {t('map.searchThisArea')}
              </button>
            </div>
            <div className="absolute" style={{ top: 18, right: 18, zIndex: 5 }}>
              <CorridorBubble fromFlag={from?.flag} toFlag={to?.flag} places={total} onView={() => navigate('/countries')} />
            </div>
            {filtersOpen && (
              <>
                <div className="absolute inset-0" style={{ background: 'rgba(20,18,14,0.28)', zIndex: 20 }} onClick={() => setFiltersOpen(false)} />
                <FiltersSheet onClose={() => setFiltersOpen(false)} count={total} city={to?.name} />
              </>
            )}
          </LandlyMap>
        </div>
      </div>
    </div>
  )
}
