import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { MyCorridors } from '@/components/account/MyCorridors'
import { MyPeople } from '@/components/account/MyPeople'
import { MyPlaces } from '@/components/account/MyPlaces'
import { ProfileSummary } from '@/components/account/ProfileSummary'
import { AppShell } from '@/components/layout/AppShell'
import { useAppShell } from '@/components/layout/appShellContext'
import { Button, EmptyState, InlineStatus, MobileHeader } from '@/components/ui'
import { useAllCountries, useLanguages, useOrganisationTypes } from '@/hooks/useCommon'
import { useCorridors } from '@/hooks/useCorridors'
import { useMyOrganisations } from '@/hooks/useOrganisations'
import { useMyPeople } from '@/hooks/usePeople'
import { useMe, useUserLanguages } from '@/hooks/useUser'
import { ROUTES } from '@/lib/routes'
import { endSession } from '@/lib/session'
import { useBreakpoint } from '@/lib/useBreakpoint'
import { MINE_MAX_LIMIT } from '@/types/api'

/** The caller's own lists are asked for in one page. */
const MINE = { limit: MINE_MAX_LIMIT }

/**
 * Account (signed in): who you are, your counters and languages, and where everything you added
 * stands — places and people in every moderation status — plus your corridors.
 */
export default function AccountPage() {
  return (
    <AppShell>
      <AccountScreen />
    </AppShell>
  )
}

function AccountScreen() {
  const { t } = useTranslation()
  const size = useBreakpoint()
  const navigate = useNavigate()
  const { openCorridors } = useAppShell()
  const me = useMe()
  const countries = useAllCountries().data ?? []
  const orgTypes = useOrganisationTypes().data ?? []
  const allLanguages = useLanguages().data ?? []
  const spoken = useUserLanguages(me.data?.id).data?.languageIds ?? []
  const places = useMyOrganisations(MINE)
  const people = useMyPeople(MINE)
  const corridors = useCorridors()

  const signOut = () => {
    endSession()
    navigate(ROUTES.landing, { replace: true })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {size === 'phone' && <MobileHeader title={t('account.title')} />}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex w-full max-w-295 flex-col gap-7.5 px-4 pt-4.5 pb-7 md:px-8 md:pt-8 md:pb-12 lg:flex-row lg:items-start lg:gap-14 lg:pt-10 lg:pb-16">
          {me.isError ? (
            <EmptyState
              icon="flag"
              tone="danger"
              title={t('account.loadFailed')}
              action={
                <Button variant="secondary" size="sm" onClick={() => void me.refetch()}>
                  {t('account.retry')}
                </Button>
              }
              className="w-full"
            />
          ) : !me.data ? (
            <InlineStatus>{t('account.loading')}</InlineStatus>
          ) : (
            <>
              <div className="lg:w-100 lg:shrink-0">
                <ProfileSummary
                  profile={me.data}
                  homeCountry={countries.find((country) => country.id === me.data.homeCountryId)}
                  languages={allLanguages.filter((language) => spoken.includes(language.id))}
                  compact={size === 'phone'}
                  onSignOut={signOut}
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-7.5">
                <MyPlaces places={places.data?.items} error={places.isError} orgTypes={orgTypes} />
                <MyPeople people={people.data?.items} error={people.isError} />
                <MyCorridors corridors={corridors.data?.items} error={corridors.isError} countries={countries} orgTypes={orgTypes} onManage={openCorridors} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
