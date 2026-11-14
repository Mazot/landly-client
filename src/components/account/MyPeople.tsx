import { useTranslation } from 'react-i18next'
import { Avatar, Callout, EmptyState, InlineStatus, List, ListItem, Section, StatusBadge, TextLink } from '@/components/ui'
import { useUiLocale } from '@/hooks/useUiLocale'
import { formatAgo } from '@/lib/dates'
import { ROUTES } from '@/lib/routes'
import { ShowMore, type ShowMoreProps } from './ShowMore'
import type { MyPerson } from '@/types/api'

export interface MyPeopleProps {
  /** `undefined` while loading. */
  people: MyPerson[] | undefined
  error: boolean
  /** Paging: more of the caller's recommendations on the server. */
  more: ShowMoreProps
}

/** "People I recommended": the caller's recommendations in every status — moderation, the claim link, the answer. */
/** What happened last: sent to moderation (or back with a note), rejected by a moderator, the claim link went out, the person answered. */
function standingKey(person: MyPerson): string {
  if (person.rejectedByModerator) return 'account.people.standing.rejected'
  if (person.status === 'pending' && person.moderationNote) return 'account.changesRequested'
  return `account.people.standing.${person.status}`
}

export function MyPeople({ people, error, more }: MyPeopleProps) {
  const { t } = useTranslation()
  const locale = useUiLocale()

  return (
    <Section as="h2" title={t('account.people.title')} action={<TextLink to={ROUTES.people}>{t('account.people.recommend')}</TextLink>}>
      {error ? (
        <Callout tone="danger">{t('account.people.loadFailed')}</Callout>
      ) : !people ? (
        <InlineStatus>{t('account.loading')}</InlineStatus>
      ) : people.length === 0 ? (
        <EmptyState icon="users" title={t('account.people.empty')} description={t('account.people.emptyHint')} />
      ) : (
        <>
          <List label={t('account.people.title')}>
          {people.map((person) => (
            <ListItem
              key={person.id}
              variant="card"
              leading={<Avatar name={person.name} />}
              title={person.name}
              subtitle={t(standingKey(person), { ago: formatAgo(person.updatedAt, locale) })}
              trailing={<StatusBadge status={person.rejectedByModerator ? 'rejected' : person.status} />}
              footer={
                person.moderationNote ? (
                  <Callout tone="danger" icon={false}>
                    <b>{t('account.moderator')}</b> {person.moderationNote}
                  </Callout>
                ) : undefined
              }
            />
          ))}
          </List>
          <ShowMore {...more} />
        </>
      )}
    </Section>
  )
}
