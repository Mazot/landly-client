import { useTranslation } from 'react-i18next'
import { Badge, EmptyState, InlineStatus, List, ListItem, OpenStatus, Rating, TypeTag } from '@/components/ui'
import type { Organisation, OrganisationType } from '@/types/api'

export interface PlaceListProps {
  places: Organisation[]
  /** Resolves `Organisation.organisationTypeId`. */
  orgTypes: OrganisationType[]
  selectedId?: string
  onSelect: (place: Organisation) => void
  loading: boolean
  error: boolean
}

// TODO: THIS IS A TMP COMPONENT
/** Places found in the map viewport — one row per place, loading / error / empty states included. */
export function PlaceList({ places, orgTypes, selectedId, onSelect, loading, error }: PlaceListProps) {
  const { t } = useTranslation()
  if (error) return <EmptyState icon="flag" tone="danger" title={t('map.error')} description={t('map.errorHint')} />
  if (loading) {
    return (
      <div className="p-4">
        <InlineStatus>{t('map.loading')}</InlineStatus>
      </div>
    )
  }
  if (places.length === 0) return <EmptyState icon="pin" title={t('map.empty')} description={t('map.emptyHint')} />
  return (
    <List label={t('map.panelTitle')} gap="sm">
      {places.map((place) => {
        const type = orgTypes.find((candidate) => candidate.id === place.organisationTypeId)
        return (
          <ListItem
            key={place.id}
            title={place.name}
            subtitle={place.address ?? place.city}
            meta={
              <>
                {type && <TypeTag slug={type.slug} label={type.title ?? type.type} color={type.color} />}
                {place.verified && (
                  <Badge tone="info" icon="verified">
                    {t('map.verified')}
                  </Badge>
                )}
                <Rating value={place.ratingAvg} count={place.reviewsCount} size="sm" />
                <OpenStatus open={place.openNow} size="sm" />
              </>
            }
            active={place.id === selectedId}
            onClick={() => onSelect(place)}
          />
        )
      })}
    </List>
  )
}
