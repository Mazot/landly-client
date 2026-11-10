import { useTranslation } from 'react-i18next'
import { Button, EmptyState, InlineStatus, List } from '@/components/ui'
import type { Organisation, OrganisationType } from '@/types/api'
import { PlaceListItem } from './PlaceListItem'

export interface PlaceListProps {
  places: Organisation[]
  /** Resolves `Organisation.organisationTypeId`. */
  orgTypes: OrganisationType[]
  selectedId?: string
  onSelect: (place: Organisation) => void
  /** Tighter rows for tablet and phone. */
  compact: boolean
  loading: boolean
  error: boolean
  /** Filters or a name search narrow the list: an empty list then says so. */
  narrowed: boolean
  onResetFilters: () => void
  /** The server stopped at the page size: more places lie in this area. */
  capped: boolean
  /** Bookmarks: both set for signed-in users only. */
  isSaved?: (place: Organisation) => boolean
  onToggleSaved?: (place: Organisation) => void
}

// TODO: first cut of the results list until the list design is done.
/** Places found in the map viewport — one row per place, with loading / error / empty states. */
export function PlaceList({ places, orgTypes, selectedId, onSelect, compact, loading, error, narrowed, onResetFilters, capped, isSaved, onToggleSaved }: PlaceListProps) {
  const { t } = useTranslation()
  if (error) return <EmptyState icon="flag" tone="danger" title={t('map.error')} description={t('map.errorHint')} />
  if (loading) {
    return (
      <div className="p-4">
        <InlineStatus>{t('map.loading')}</InlineStatus>
      </div>
    )
  }
  if (places.length === 0) {
    return narrowed ? (
      <EmptyState
        icon="search"
        title={t('map.noMatches')}
        description={t('map.noMatchesHint')}
        action={
          <Button variant="secondary" size="sm" onClick={onResetFilters}>
            {t('map.resetFilters')}
          </Button>
        }
      />
    ) : (
      <EmptyState icon="pin" title={t('map.empty')} description={t('map.emptyHint')} />
    )
  }
  return (
    <>
      <List label={t('map.panelTitle')} gap="sm">
        {places.map((place) => (
          <PlaceListItem
            key={place.id}
            place={place}
            type={orgTypes.find((candidate) => candidate.id === place.organisationTypeId)}
            active={place.id === selectedId}
            compact={compact}
            onSelect={onSelect}
            saved={isSaved?.(place)}
            onToggleSaved={onToggleSaved}
          />
        ))}
      </List>
      <p className="m-0 px-4 py-3.5 text-center text-label font-medium text-ink-3">{capped ? t('map.capped', { count: places.length }) : t('map.moveToSearch')}</p>
    </>
  )
}
