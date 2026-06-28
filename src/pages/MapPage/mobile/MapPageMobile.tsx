import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDisplayOrgs } from '@/hooks/useDisplayOrgs'
import type { RailKey } from '@/components/ui/ColoredTypeRail'
import type { SheetState } from '@/components/mobile/BottomSheet'
import type { Country } from '@/types/api'
import TopBar from '@/components/ui/TopBar'
import ColoredTypeRail from '@/components/ui/ColoredTypeRail'
import SearchInput from '@/components/ui/SearchInput'
import Pill from '@/components/ui/Pill'
import Icon from '@/components/ui/Icon'
import LandlyMap, { type MapMarker } from '@/components/map/LandlyMap'
import FiltersSheet from '@/components/map/FiltersSheet'
import BottomSheet from '@/components/mobile/BottomSheet'
import MobileBottomNav from '@/components/mobile/MobileBottomNav'
import OrgListItem from '../OrgListItem'
import { SORTS } from '../constants'

interface MapPageMobileProps {
  from: Country | undefined
  to: Country | undefined
  toId: string | null
}

export default function MapPageMobile({ to, toId }: MapPageMobileProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeType, setActiveType] = useState<RailKey>('all')
  const [sheetState, setSheetState] = useState<SheetState>('peek')
  const [search, setSearch] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { items, total, isLoading } = useDisplayOrgs({ location_country_id: toId ?? undefined, limit: 100 })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter(
      (o) => (activeType === 'all' || o.typeKey === activeType) &&
              (q === '' || o.name.toLowerCase().includes(q))
    )
  }, [items, activeType, search])

  const markers: MapMarker[] = useMemo(
    () => filtered.filter((o) => o.coord).map((o) => ({ id: o.id, coord: o.coord!, type: o.typeKey, name: o.name })),
    [filtered]
  )

  const mapOpen = sheetState === 'open'

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <TopBar />

      {/* Filter strip — always visible */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-1)', flexShrink: 0 }}>
        <div style={{ padding: '8px 14px 0' }}>
          <SearchInput value={search} onChange={setSearch} placeholder={t('map.searchPlaceholder')} style={{ height: 40 }} />
        </div>
        <div style={{ padding: '7px 14px 9px', overflowX: 'auto' }}>
          <ColoredTypeRail active={activeType} onPick={setActiveType} />
        </div>
      </div>

      {/* Map area — compresses to 190px when sheet is open */}
      <div
        style={{
          position: 'relative',
          flexShrink: 0,
          height: mapOpen ? 190 : undefined,
          flex: mapOpen ? undefined : 1,
          background: 'var(--country-water)',
          transition: 'height 0.3s cubic-bezier(0.32,0,0.67,0)',
          overflow: 'hidden',
        }}
      >
        <LandlyMap markers={markers} fitToMarkers zoom={5} showControls={false} interactive />

        {/* Search this area */}
        <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
          <button
            style={{
              padding: '8px 14px', background: 'var(--surface)', color: 'var(--ink-1)',
              border: '1px solid var(--border-1)', borderRadius: 999, font: '600 12.5px/1 var(--font-sans)',
              boxShadow: 'var(--shadow-2)', display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap', cursor: 'pointer',
            }}
          >
            <Icon name="search" size={12} /> {t('map.searchThisArea')}
          </button>
        </div>

        {/* Map controls */}
        <div style={{ position: 'absolute', right: 12, bottom: mapOpen ? 14 : 180, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 5, transition: 'bottom 0.3s' }}>
          {([['plus', '+'], ['zoomOut', '−'], ['locate', '⌖']] as const).map(([ic, label]) => (
            <button
              key={ic}
              style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--surface)', border: '1px solid var(--border-1)', boxShadow: 'var(--shadow-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              aria-label={label}
            >
              <Icon name={ic} size={15} />
            </button>
          ))}
        </div>

        {/* Bottom sheet — peeking state */}
        {!mapOpen && (
          <BottomSheet state="peek" onStateChange={setSheetState} peekHeight={200}>
            <div style={{ padding: '0 16px 14px', flex: 1 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                <div>
                  <span style={{ font: '600 15px/1 var(--font-sans)' }}>{t('map.organizationsCount', { count: total })}</span>
                  <span style={{ font: '500 12.5px/1 var(--font-sans)', color: 'var(--ink-3)', marginLeft: 6 }}>
                    {t('map.showingIn', { country: to?.name ?? '—' })}
                  </span>
                </div>
                <div className="flex" style={{ gap: 5 }}>
                  <Pill active style={{ height: 26, fontSize: 12, cursor: 'pointer' }}>
                    {t('map.sort.nearest', 'Nearest')}
                  </Pill>
                </div>
              </div>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '16px 0', font: '500 13px/1 var(--font-sans)', color: 'var(--ink-3)' }}>
                  {t('map.loading')}
                </div>
              ) : (
                filtered.slice(0, 2).map((o) => (
                  <OrgListItem key={o.id} org={o} active={false} compact onSelect={() => setSheetState('open')} />
                ))
              )}
            </div>
          </BottomSheet>
        )}

        {/* Filters overlay */}
        {filtersOpen && (
          <>
            <div className="absolute inset-0" style={{ background: 'rgba(20,18,14,0.28)', zIndex: 20 }} onClick={() => setFiltersOpen(false)} />
            <FiltersSheet onClose={() => setFiltersOpen(false)} count={total} city={to?.name} />
          </>
        )}
      </div>

      {/* Sheet fully open — below map */}
      {mapOpen && (
        <div
          style={{
            flex: 1, background: 'var(--surface)', borderRadius: '20px 20px 0 0',
            marginTop: -20, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 5,
            boxShadow: '0 -4px 24px rgba(20,18,14,0.10)',
          }}
        >
          <div
            onClick={() => setSheetState('peek')}
            style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-2)' }} />
          </div>
          <div style={{ padding: '0 14px 8px', flexShrink: 0 }}>
            <SearchInput value={search} onChange={setSearch} placeholder={t('map.searchPlaceholder')} style={{ height: 40 }} />
            <div style={{ display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto' }}>
              <ColoredTypeRail active={activeType} onPick={setActiveType} />
            </div>
          </div>
          <div className="flex items-center justify-between" style={{ padding: '0 14px 8px', flexShrink: 0 }}>
            <span style={{ font: '600 14px/1 var(--font-sans)' }}>
              {total}
              <span style={{ font: '500 12.5px/1 var(--font-sans)', color: 'var(--ink-3)', marginLeft: 5 }}>
                {t('map.showingIn', { country: to?.name ?? '—' })}
              </span>
            </span>
            <div className="flex" style={{ gap: 4 }}>
              {SORTS.map((s) => (
                <Pill key={s} style={{ height: 24, fontSize: 11, cursor: 'pointer' }}>
                  {t(`map.sort.${s}`)}
                </Pill>
              ))}
            </div>
          </div>
          <div className="l-scroll" style={{ flex: 1, overflow: 'auto', padding: '0 10px 12px' }}>
            {filtered.map((o) => (
              <OrgListItem key={o.id} org={o} active={false} compact onSelect={() => navigate(`/org/${o.id}`)} />
            ))}
          </div>
        </div>
      )}

      <MobileBottomNav />
    </div>
  )
}
