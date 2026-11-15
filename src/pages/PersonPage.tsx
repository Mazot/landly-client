import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { PersonContacts } from '@/components/people/PersonContacts'
import { PlaceReviews } from '@/components/place/PlaceReviews'
import { Avatar, Badge, Button, Card, EmptyState, Icon, InlineStatus, MobileHeader, Rating, Section, StatusBadge, Tag, TextLink } from '@/components/ui'
import { useLanguages } from '@/hooks/useCommon'
import { usePerson } from '@/hooks/usePeople'
import { apiErrorStatus } from '@/lib/errors'
import { ROUTES } from '@/lib/routes'
import { useBreakpoint } from '@/lib/useBreakpoint'
import type { Person } from '@/types/api'

/** The server's answer for an id it does not know. */
const HTTP_NOT_FOUND = 404

/** Reviews shown on the profile: fewer on a phone. */
const PERSON_REVIEWS = { phone: 2, wide: 3 } as const

/** A helper's profile (public): who they are, how they help, who speaks for them, and — as they allow — how to reach them. */
export default function PersonPage() {
  return (
    <AppShell>
      <PersonScreen />
    </AppShell>
  )
}

function Frame({ phone, title, onBack, children }: { phone: boolean; title: string; onBack: () => void; children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {phone && <MobileHeader back="back" onBack={onBack} title={title} />}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" aria-label={t('person.title')}>
        {children}
      </div>
    </div>
  )
}

function PersonScreen() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const size = useBreakpoint()
  const navigate = useNavigate()
  const person = usePerson(id)
  const back = () => navigate(ROUTES.people)
  const phone = size === 'phone'

  if (person.isError) {
    const missing = apiErrorStatus(person.error) === HTTP_NOT_FOUND
    return (
      <Frame phone={phone} title={t('person.title')} onBack={back}>
        <EmptyState
          icon="users"
          tone={missing ? 'neutral' : 'danger'}
          title={t(missing ? 'person.notFound' : 'person.loadFailed')}
          action={
            missing ? (
              <Button to={ROUTES.people} variant="secondary" size="sm">
                {t('person.backToPeople')}
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => void person.refetch()}>
                {t('person.retry')}
              </Button>
            )
          }
        />
      </Frame>
    )
  }
  if (!person.data) {
    return (
      <Frame phone={phone} title={t('person.title')} onBack={back}>
        <InlineStatus>{t('person.loading')}</InlineStatus>
      </Frame>
    )
  }
  // Keyed by the person: another profile starts at the top.
  return <Profile key={person.data.id} person={person.data} phone={phone} wide={size === 'desktop'} onBack={back} />
}

function Profile({ person, phone, wide, onBack }: { person: Person; phone: boolean; wide: boolean; onBack: () => void }) {
  const { t } = useTranslation()
  const languages = useLanguages().data ?? []
  const spoken = person.languageIds.flatMap((languageId) => languages.find((language) => language.id === languageId)?.name ?? [])

  const side = (
    <Card padding="lg">
      <PersonContacts person={person} />
    </Card>
  )

  return (
    <Frame phone={phone} title={person.name} onBack={onBack}>
      {!phone && (
        <nav aria-label={t('person.breadcrumbs')} className="flex h-13 items-center gap-2.5 border-b border-border-1 bg-surface px-8 text-label font-medium text-ink-3">
          <TextLink to={ROUTES.people} icon="arrowLeft" tone="muted">
            {t('person.people')}
          </TextLink>
          <Icon name="chevronRight" size={11} />
          <span aria-current="page" className="min-w-0 truncate text-ink-1">
            {person.name}
          </span>
        </nav>
      )}
      <div className="mx-auto flex w-full max-w-270 flex-col gap-7 px-4.5 pt-5 pb-8 md:px-8 md:pt-8 md:pb-12 lg:flex-row lg:items-start lg:gap-12 lg:pt-10 lg:pb-16">
        <div className="flex min-w-0 flex-1 flex-col gap-7.5">
          <div className="flex items-center gap-4 md:gap-5">
            <Avatar name={person.name} size={phone ? 'xl' : '2xl'} />
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap gap-1.75">
                <StatusBadge status={person.status} />
                {person.city && <Badge>{person.city}</Badge>}
              </div>
              <h1 className="m-0 font-display text-display-lg text-ink-1">{person.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3.5">
                {person.allowReviews ? <Rating value={person.ratingAvg} count={person.reviewsCount} /> : <span className="text-label font-medium text-ink-4">{t('people.reviewsOff')}</span>}
                <span className="inline-flex items-center gap-1.25 text-label font-semibold text-ink-2">
                  <Icon name="heart" size={13} />
                  {t('people.vouches', { count: person.vouches })}
                </span>
              </div>
            </div>
          </div>
          {!wide && side}
          {(person.bio || person.skills.length > 0) && (
            <Section title={t('person.howTheyHelp')} as="h2">
              {person.bio && <p className="m-0 mb-3.5 max-w-165 text-md font-medium text-pretty text-ink-2">{person.bio}</p>}
              {person.skills.length > 0 && (
                <ul aria-label={t('person.howTheyHelp')} className="m-0 flex list-none flex-wrap gap-1.75 p-0">
                  {person.skills.map((skill) => (
                    <li key={skill}>
                      <Tag size="md">{skill}</Tag>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          )}
          {spoken.length > 0 && (
            <Section title={t('person.speaks')} as="h2">
              <ul aria-label={t('person.speaks')} className="m-0 flex list-none flex-wrap gap-1.75 p-0">
                {spoken.map((name) => (
                  <li key={name}>
                    <Tag size="md">{name}</Tag>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {person.allowReviews && (
            <Section title={t('place.reviews.title')} as="h2">
              <PlaceReviews personId={person.id} limit={phone ? PERSON_REVIEWS.phone : PERSON_REVIEWS.wide} compact={phone} />
            </Section>
          )}
          {person.recommendedBy && (
            <Section title={t('person.recommendedBy')} as="h2">
              <Card padding="md" className="flex items-center gap-3">
                <Avatar name={person.recommendedBy.name || person.recommendedBy.username} color={person.recommendedBy.avatarColor} size="md" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-ink-1">{person.recommendedBy.name || person.recommendedBy.username}</div>
                  <div className="mt-1 text-label font-medium text-ink-3">{t(person.status === 'claimed' ? 'person.confirmedAndClaimed' : 'person.confirmed', { name: person.name })}</div>
                </div>
              </Card>
            </Section>
          )}
        </div>
        {wide && <aside className="lg:sticky lg:top-5 lg:w-85 lg:shrink-0">{side}</aside>}
      </div>
    </Frame>
  )
}
