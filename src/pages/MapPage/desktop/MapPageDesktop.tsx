import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDisplayOrgs, useDisplayOrg } from '@/hooks/useDisplayOrgs'
import type { RailKey } from '@/components/ui/ColoredTypeRail'
import type { Country } from '@/types/api'
import TopBar from '@/components/ui/TopBar'
import ColoredTypeRail from '@/components/ui/ColoredTypeRail'
import SearchInput from '@/components/ui/SearchInput'
import Button from '@/components/ui/Button'
import Pill from '@/components/ui/Pill'
import Icon from '@/components/ui/Icon'
import CorridorBubble from '@/components/ui/CorridorBubble'
import LandlyMap, { type MapMarker } from '@/components/map/LandlyMap'
import FiltersSheet from '@/components/map/FiltersSheet'
import OrgCompactPanel from '@/components/map/OrgCompactPanel'
import Sidebar from '../Sidebar'

interface MapPageDesktopProps {
  from: Country | undefined
  to: Country | undefined
  toId: string | null
}

export default function MapPageDesktop({ from, to, toId }: MapPageDesktopProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeType, setActiveType] = useState<RailKey>('all')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [ruOnly, setRuOnly] = useState(false)
  const [verified, setVerified] = useState(false)
  const [search, setSearch] = useState('')

  const { items, total, isLoading } = useDisplayOrgs({ location_country_id: toId ?? undefined, limit: 100 })
  const activeOrgId = searchParams.get('org')
  const { org: activeOrg } = useDisplayOrg(activeOrgId ?? '')

  const selectOrg = (id: string) => setSearchParams({ org: id })
  const clearOrg = () => setSearchParams({})

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter(
      (o) => (activeType === 'all' || o.typeKey === activeType) &&
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
