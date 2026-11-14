import { compact as compactList } from 'es-toolkit'
import { useTranslation } from 'react-i18next'
import { Avatar, Badge, Button, PageHeader, Section, Stat, Tag, TextLink } from '@/components/ui'
import { ROUTES } from '@/lib/routes'
import type { Country, Language, UserProfile } from '@/types/api'

export interface ProfileSummaryProps {
  profile: UserProfile
  /** The profile's home country, once the country list knows it. */
  homeCountry?: Country
  /** Languages the user speaks. */
  languages: Language[]
  /** Larger avatar from tablet up. */
  compact: boolean
  onSignOut: () => void
}

/** Who the account is: avatar, name, where from, why here, bio, the four counters and the languages. */
export function ProfileSummary({ profile, homeCountry, languages, compact, onSignOut }: ProfileSummaryProps) {
  const { t } = useTranslation()
  const name = profile.name || profile.username
  const from = homeCountry && t('account.from', { country: compactList([homeCountry.flag, homeCountry.name]).join(' ') })
  const facts = compactList([`@${profile.username}`, profile.city, from]).join(' · ')
  const stats = [
    [profile.stats.placesAdded, t('account.stats.placesAdded', { count: profile.stats.placesAdded })],
    [profile.stats.peopleRecommended, t('account.stats.peopleRecommended', { count: profile.stats.peopleRecommended })],
    [profile.stats.reviews, t('account.stats.reviews', { count: profile.stats.reviews })],
    [profile.stats.saved, t('account.stats.saved', { count: profile.stats.saved })],
  ] as const

  return (
    <div className="flex flex-col gap-5.5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3.5 md:gap-4.5">
          <Avatar name={name} color={profile.avatarColor} size={compact ? 'xl' : '2xl'} />
          <div className="flex min-w-0 flex-col gap-2">
            <PageHeader size="md" title={name} lede={facts} />
            {profile.hereAs && (
              <div>
                <Badge tone="accent">{t(`auth.hereAs.${profile.hereAs}`)}</Badge>
              </div>
            )}
          </div>
        </div>
        {profile.bio && <p className="m-0 text-sm font-medium text-pretty text-ink-2">{profile.bio}</p>}
        <div className="flex gap-2">
          <Button to={ROUTES.accountEdit} variant="secondary" size="sm" icon="pencil" block={compact}>
            {t('account.editProfile')}
          </Button>
          <Button variant="secondary" size="sm" block={compact} onClick={onSignOut}>
            {t('account.signOut')}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {stats.map(([value, label]) => (
          <Stat key={label} value={value} label={label} />
        ))}
      </div>
      <Section
        as="h2"
        title={t('account.languages.title')}
        action={
          <TextLink to={ROUTES.accountEdit}>{t('account.languages.edit')}</TextLink>
        }
      >
        {languages.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {languages.map((language) => (
              <Tag key={language.id}>{language.name}</Tag>
            ))}
          </div>
        ) : (
          <p className="m-0 text-label font-medium text-ink-3">{t('account.languages.empty')}</p>
        )}
      </Section>
    </div>
  )
}
