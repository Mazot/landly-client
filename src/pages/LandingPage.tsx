import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { CorridorPicker } from '@/components/corridor/CorridorPicker'
import { LanguageSelect } from '@/components/layout/LanguageSelect'
import { Accent, Button, Card, Logo, MapBackdrop, PageHeader, TextLink, TopBar, TypeBar } from '@/components/ui'
import { useCountry, useOrganisationTypes } from '@/hooks/useCommon'
import { useGuestCorridor } from '@/hooks/useGuestCorridor'
import { ROUTES } from '@/lib/routes'

/** Public landing: pick a corridor and open the map without an account. */
export default function LandingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const corridor = useGuestCorridor()
  // Live-place counts of the destination are public (`GET /api/common/countries/{id}`).
  const destination = useCountry(corridor.to?.id)
  const orgTypes = useOrganisationTypes()

  const titles = new Map(orgTypes.data?.map((type) => [type.slug, type.title]))
  const segments = (destination.data?.placesByType ?? []).map((entry) => ({ slug: entry.slug, count: entry.count, label: titles.get(entry.slug) ?? entry.slug }))
  const total = destination.data?.totalPlaces

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar
        brand={<Logo to={ROUTES.landing} size="sm" />}
        actions={
          <>
            <div className="md:hidden">
              <TextLink to={ROUTES.signIn} tone="strong" size="md">
                {t('auth.signIn.submit')}
              </TextLink>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <LanguageSelect />
              <Button to={ROUTES.signIn} variant="secondary" size="sm">
                {t('auth.signIn.submit')}
              </Button>
              <Button to={ROUTES.signUp} variant="accent" size="sm">
                {t('auth.signUp.action')}
              </Button>
            </div>
          </>
        }
      />
      <main className="relative flex flex-1 flex-col">
        <MapBackdrop variant="hero" className="absolute inset-0" />
        <div className="relative flex flex-1 flex-col gap-5.5 px-5 py-6.5 md:gap-7.5 md:px-12 md:py-22 lg:px-20">
          <PageHeader
            size="hero"
            eyebrow={t('landing.eyebrow')}
            title={<Trans i18nKey="landing.title" components={{ accent: <Accent>x</Accent> }} />}
            lede={t('landing.lede')}
            className="max-w-175"
          />
          <Card variant="elevated" padding="lg" className="w-full lg:max-w-140">
            <div className="flex flex-col gap-3.5">
              <CorridorPicker corridor={corridor} fromLabel={t('landing.from')} toLabel={t('landing.to')} stackOnPhone />
              <Button
                variant="accent"
                size="lg"
                className="w-full"
                disabled={!corridor.ready}
                onClick={() => {
                  corridor.commit()
                  navigate(ROUTES.map)
                }}
              >
                {total === undefined ? t('landing.openMapPlain') : t('landing.openMap', { count: total })}
              </Button>
              {segments.length > 0 && <TypeBar label={t('landing.byType')} segments={segments} />}
            </div>
          </Card>
          <div className="mt-auto flex gap-2.5 md:hidden">
            <Button to={ROUTES.signIn} variant="secondary" block>
              {t('auth.signIn.submit')}
            </Button>
            <Button to={ROUTES.signUp} variant="primary" block>
              {t('auth.signUp.action')}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
