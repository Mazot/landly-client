import { useTranslation } from 'react-i18next'
import { CorridorCard } from '@/components/corridor/CorridorCard'
import { Callout, EmptyState, InlineStatus, List, Section, TextLink } from '@/components/ui'
import type { Corridor, Country, OrganisationType } from '@/types/api'

export interface MyCorridorsProps {
  /** `undefined` while loading. */
  corridors: Corridor[] | undefined
  error: boolean
  countries: Country[]
  orgTypes: OrganisationType[]
  /** Opens the corridor picker. */
  onManage: () => void
}

/** "My corridors": the saved corridors at a glance; "Manage" opens the corridor picker. */
export function MyCorridors({ corridors, error, countries, orgTypes, onManage }: MyCorridorsProps) {
  const { t } = useTranslation()
  const country = (id: string) => countries.find((candidate) => candidate.id === id)

  return (
    <Section as="h2" title={t('account.corridors.title')} action={<TextLink onClick={onManage}>{t('account.corridors.manage')}</TextLink>}>
      {error ? (
        <Callout tone="danger">{t('corridors.loadFailed')}</Callout>
      ) : !corridors ? (
        <InlineStatus>{t('account.loading')}</InlineStatus>
      ) : corridors.length === 0 ? (
        <EmptyState icon="globe" title={t('account.corridors.empty')} description={t('account.corridors.emptyHint')} />
      ) : (
        <List label={t('account.corridors.title')}>
          {corridors.map((corridor) => (
            <CorridorCard key={corridor.id} compact corridor={corridor} from={country(corridor.fromCountryId)} to={country(corridor.toCountryId)} orgTypes={orgTypes} />
          ))}
        </List>
      )}
    </Section>
  )
}
