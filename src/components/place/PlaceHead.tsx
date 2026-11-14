import { useTranslation } from 'react-i18next'
import { Badge, Meta, PageHeader, Rating, StatusBadge, TypeTag } from '@/components/ui'
import type { Organisation, OrganisationType } from '@/types/api'
import { PlaceOpenStatus } from './PlaceOpenStatus'

export interface PlaceHeadProps {
  place: Organisation
  /** The place's organisation type, when it has one. */
  type: OrganisationType | undefined
  /** The map's panel: a smaller title. */
  compact?: boolean
  as?: 'h1' | 'h2'
}

/** Type, verified / moderation badges, name, address, open state, rating and visits. */
export function PlaceHead({ place, type, compact, as = 'h1' }: PlaceHeadProps) {
  const { t, i18n } = useTranslation()
  const address = place.address ?? place.city
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.75">
        {type && <TypeTag slug={type.slug} label={type.title ?? type.type} color={type.color} variant="soft" />}
        {place.verified && (
          <Badge tone="info" icon="verified">
            {t('place.verified')}
          </Badge>
        )}
        {place.status !== 'live' && <StatusBadge status={place.status} />}
      </div>
      <PageHeader as={as} size={compact ? 'md' : 'lg'} title={place.name} lede={address ?? undefined} />
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
        <PlaceOpenStatus place={place} />
        <Rating value={place.ratingAvg} count={place.reviewsCount} />
        <Meta icon="eye">{t('place.visits', { count: place.visitsCount, formatted: place.visitsCount.toLocaleString(i18n.resolvedLanguage) })}</Meta>
      </div>
    </div>
  )
}
