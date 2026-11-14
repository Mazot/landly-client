import { useTranslation } from 'react-i18next'
import { Avatar, Callout, EmptyState, InlineStatus, List, ListItem, Section, StatusBadge, TextLink } from '@/components/ui'
import { useUiLocale } from '@/hooks/useUiLocale'
import { formatAgo } from '@/lib/dates'
import { ROUTES } from '@/lib/routes'
import type { MyPerson } from '@/types/api'

export interface MyPeopleProps {
  /** `undefined` while loading. */
  people: MyPerson[] | undefined
  error: boolean
}

/** "People I recommended": the caller's recommendations in every status — moderation, the claim link, the answer. */
export function MyPeople({ people, error }: MyPeopleProps) {
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
        <List label={t('account.people.title')}>
          {people.map((person) => (
            <ListItem
              key={person.id}
              variant="card"
              leading={<Avatar name={person.name} />}
              title={person.name}
              // What happened last: sent to moderation (or sent back with a note), the claim link went out, the person answered.
              subtitle={t(person.status === 'pending' && person.moderationNote ? 'account.changesRequested' : `account.people.standing.${person.status}`, { ago: formatAgo(person.updatedAt, locale) })}
              trailing={<StatusBadge status={person.status} />}
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
      )}
    </Section>
  )
}
