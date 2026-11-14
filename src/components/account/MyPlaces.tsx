import { useTranslation } from 'react-i18next'
import { Avatar, Callout, colors, EmptyState, InlineStatus, List, ListItem, Section, StatusBadge, TextLink } from '@/components/ui'
import { useUiLocale } from '@/hooks/useUiLocale'
import { formatAgo, formatDay } from '@/lib/dates'
import { ROUTES } from '@/lib/routes'
import type { MyOrganisation, OrganisationType } from '@/types/api'

export interface MyPlacesProps {
  /** `undefined` while loading. */
  places: MyOrganisation[] | undefined
  error: boolean
  /** Resolves `organisationTypeId`. */
  orgTypes: OrganisationType[]
}

/**
 * Where a submission stands, from its status and the time of its last change (moderation
 * touches `updatedAt`): live since a day, changes asked for, waiting, or rejected.
 */
function standing(place: MyOrganisation, locale: string, t: (key: string, values: Record<string, string>) => string): string {
  if (place.status === 'live') return t('account.places.liveSince', { date: formatDay(place.updatedAt, locale) })
  const ago = formatAgo(place.updatedAt, locale)
  if (place.status === 'rejected') return t('account.places.rejected', { ago })
  return place.moderationNote ? t('account.changesRequested', { ago }) : t('account.places.submitted', { ago })
}

/** "My places": the caller's own organisations in every moderation status, with the moderator's note. */
export function MyPlaces({ places, error, orgTypes }: MyPlacesProps) {
  const { t } = useTranslation()
  const locale = useUiLocale()

  return (
    <Section as="h2" title={t('account.places.title')} subtitle={t('account.places.subtitle')} action={<TextLink to={ROUTES.add}>{t('account.places.add')}</TextLink>}>
      {error ? (
        <Callout tone="danger">{t('account.places.loadFailed')}</Callout>
      ) : !places ? (
        <InlineStatus>{t('account.loading')}</InlineStatus>
      ) : places.length === 0 ? (
        <EmptyState icon="pin" title={t('account.places.empty')} description={t('account.places.emptyHint')} />
      ) : (
        <List label={t('account.places.title')}>
          {places.map((place) => {
            const type = orgTypes.find((candidate) => candidate.id === place.organisationTypeId)
            const typeColor = type?.color ?? (type?.slug ? colors.type[type.slug as keyof typeof colors.type]?.DEFAULT : undefined)
            return (
              <ListItem
                key={place.id}
                variant="card"
                leading={<Avatar name={place.name} color={typeColor} />}
                title={place.name}
                subtitle={[type && (type.title ?? type.type), standing(place, locale, t)].filter(Boolean).join(' · ')}
                trailing={<StatusBadge status={place.status} />}
                footer={
                  place.moderationNote ? (
                    <Callout tone="danger" icon={false}>
                      <b>{t('account.moderator')}</b> {place.moderationNote}
                    </Callout>
                  ) : undefined
                }
              />
            )
          })}
        </List>
      )}
    </Section>
  )
}
