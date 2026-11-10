import { useTranslation } from 'react-i18next'
import { Button, Chip, CorridorPill, IconButton, SearchField } from '@/components/ui'
import type { Breakpoint } from '@/lib/useBreakpoint'
import type { MapFilters } from '@/lib/mapFilters'
import type { OrganisationType } from '@/types/api'
import { TypeRail } from './TypeRail'

export interface MapToolbarProps {
  size: Breakpoint
  filters: MapFilters
  onFiltersChange: (filters: MapFilters) => void
  orgTypes: OrganisationType[]
  /** Name search over the places in view. */
  query: string
  onQueryChange: (query: string) => void
  /** Filter groups that are on — the number on "More filters". */
  activeCount: number
  onOpenFilters: () => void
  /** Destination name for the phone's search placeholder. */
  destination?: string
  /** The corridor pill floating over the map on phones: flags, accessible label, destination, opener. */
  corridor?: { from: string | null; to: string | null; label: string; name: string; onOpen: () => void }
}

/**
 * Search, type rail and quick filters. Desktop: one bar (search, types, open now, verified, more filters).
 * Tablet: search + filters button, then the types. Phone: floating search, filters button, corridor pill, types.
 */
export function MapToolbar({ size, filters, onFiltersChange, orgTypes, query, onQueryChange, activeCount, onOpenFilters, destination, corridor }: MapToolbarProps) {
  const { t } = useTranslation()
  const rail = <TypeRail orgTypes={orgTypes} value={filters.types} onChange={(types) => onFiltersChange({ ...filters, types })} size={size === 'desktop' ? 'md' : 'sm'} />
  const filterLabel = activeCount ? `${t('filters.title')} · ${activeCount}` : t('filters.title')

  if (size === 'phone') {
    return (
      <>
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <SearchField variant="floating" aria-label={t('map.search')} placeholder={t('map.searchIn', { country: destination ?? '' })} value={query} onChange={(event) => onQueryChange(event.target.value)} />
          </div>
          <IconButton icon="sliders" variant="floating" size="lg" label={filterLabel} onClick={onOpenFilters} />
        </div>
        <div className="flex items-center gap-1.5">
          {corridor && <CorridorPill dark from={corridor.from} to={corridor.to} label={corridor.label} name={corridor.name} onClick={corridor.onOpen} />}
          <div className="min-w-0 flex-1">{rail}</div>
        </div>
      </>
    )
  }

  const search = <SearchField aria-label={t('map.search')} placeholder={t('map.searchPlaceholder')} value={query} onChange={(event) => onQueryChange(event.target.value)} />
  if (size === 'tablet') {
    return (
      <>
        <div className="flex w-full gap-2.5">
          <div className="min-w-0 flex-1">{search}</div>
          <Button variant="secondary" icon="sliders" onClick={onOpenFilters}>
            {filterLabel}
          </Button>
        </div>
        <div className="w-full min-w-0">{rail}</div>
      </>
    )
  }
  return (
    <>
      <div className="w-80 shrink-0">{search}</div>
      <div className="min-w-0 flex-1">{rail}</div>
      <Chip size="sm" selected={filters.openNow} onClick={() => onFiltersChange({ ...filters, openNow: !filters.openNow })}>
        {t('filters.openNow')}
      </Chip>
      <Chip size="sm" selected={filters.verified} onClick={() => onFiltersChange({ ...filters, verified: !filters.verified })}>
        {t('map.verified')}
      </Chip>
      <Button variant="secondary" size="sm" icon="sliders" onClick={onOpenFilters}>
        {activeCount ? `${t('map.moreFilters')} · ${activeCount}` : t('map.moreFilters')}
      </Button>
    </>
  )
}
