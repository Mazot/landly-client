import { useTranslation } from 'react-i18next'
import { Avatar, Card, Meta, Text } from '@/components/ui'
import type { Organisation } from '@/types/api'

export interface PlaceAddedByProps {
  place: Pick<Organisation, 'creator' | 'locationSource'>
}

/** Who added the place (their public face) and whether its point comes from Google; nothing when neither is known. */
export function PlaceAddedBy({ place }: PlaceAddedByProps) {
  const { t } = useTranslation()
  const fromGoogle = place.locationSource === 'google'
  if (!place.creator && !fromGoogle) return null
  const name = place.creator ? place.creator.name || place.creator.username : undefined

  return (
    <Card padding="md" className="flex flex-wrap items-center gap-3">
      {place.creator && name && (
        <>
          <Avatar name={name} color={place.creator.avatarColor} size="md" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Text as="span" tone="strong" weight="bold" truncate>
              {name}
            </Text>
            <Text as="span" size="xs" tone="muted">
              {t('place.addedBy.who', { username: place.creator.username })}
            </Text>
          </div>
        </>
      )}
      {fromGoogle && <Meta icon="google">{t('place.addedBy.fromGoogle')}</Meta>}
    </Card>
  )
}
