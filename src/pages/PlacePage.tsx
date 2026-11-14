import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ConsularNetwork } from '@/components/place/ConsularNetwork'
import { PlaceActions } from '@/components/place/PlaceActions'
import { PlaceAddedBy } from '@/components/place/PlaceAddedBy'
import { PlaceCommunity } from '@/components/place/PlaceCommunity'
import { PlaceContacts } from '@/components/place/PlaceContacts'
import { PlaceHead } from '@/components/place/PlaceHead'
import { PlaceHours } from '@/components/place/PlaceHours'
import { PlaceMiniMap } from '@/components/place/PlaceMiniMap'
import { PlacePhotos } from '@/components/place/PlacePhotos'
import { PlaceReviews } from '@/components/place/PlaceReviews'
import { Button, Card, Divider, EmptyState, Icon, IconButton, ImageFrame, InlineStatus, MobileHeader, Section, Tag, TextLink } from '@/components/ui'
import { useAllCountries, useOrganisationTypes } from '@/hooks/useCommon'
import { useOrganisationImages } from '@/hooks/useImages'
import { useCountVisit, useOrganisation } from '@/hooks/useOrganisations'
import { useSavedPlaces } from '@/hooks/useSavedPlaces'
import { apiErrorStatus } from '@/lib/errors'
import { ROUTES, type ReturnState } from '@/lib/routes'
import { useBreakpoint } from '@/lib/useBreakpoint'
import { useAuthStore } from '@/stores/authStore'
import type { Organisation } from '@/types/api'

/** The server's answer for an id it does not know. */
const HTTP_NOT_FOUND = 404

/** Reviews shown on the page: fewer on a phone. */
const PAGE_REVIEWS = { phone: 2, wide: 3 } as const

/** An organisation's full page (public): everything the map's panel shows and the rest of the design. */
export default function PlacePage() {
  return (
    <AppShell>
      <PlaceScreen />
    </AppShell>
  )
}

function PlaceScreen() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const size = useBreakpoint()
  const navigate = useNavigate()
  const place = useOrganisation(id)
  useCountVisit(id)

  const back = () => navigate(ROUTES.map)
  const phone = size === 'phone'

  if (place.isError) {
    const missing = apiErrorStatus(place.error) === HTTP_NOT_FOUND
    return (
      <Shell phone={phone} title={t('place.title')} onBack={back}>
        <EmptyState
          icon="pin"
          tone={missing ? 'neutral' : 'danger'}
          title={t(missing ? 'place.notFound' : 'place.loadFailed')}
          action={
            missing ? (
              <Button to={ROUTES.map} variant="secondary" size="sm">
                {t('place.backToMap')}
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => void place.refetch()}>
                {t('place.retry')}
              </Button>
            )
          }
        />
      </Shell>
    )
  }
  if (!place.data) {
    return (
      <Shell phone={phone} title={t('place.title')} onBack={back}>
        <InlineStatus>{t('place.loading')}</InlineStatus>
      </Shell>
    )
  }
  // Keyed by the place: another place (a consular-network link) starts at the top, with its own mini map.
  return <PlaceDetail key={place.data.id} place={place.data} phone={phone} wide={size === 'desktop'} onBack={back} />
}

/** Page frame: the phone header, or nothing (the app bar is enough) from tablets up. */
function Shell({ phone, title, onBack, trailing, children }: { phone: boolean; title: string; onBack: () => void; trailing?: ReactNode; children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {phone && <MobileHeader back="back" onBack={onBack} title={title} trailing={trailing} />}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" aria-label={t('place.title')}>
        {children}
      </div>
    </div>
  )
}

function PlaceDetail({ place, phone, wide, onBack }: { place: Organisation; phone: boolean; wide: boolean; onBack: () => void }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const saved = useSavedPlaces()
  const types = useOrganisationTypes().data ?? []
  const countries = useAllCountries().data ?? []
  const images = useOrganisationImages(place.id).data?.items ?? []
  const type = types.find((candidate) => candidate.id === place.organisationTypeId)
  const country = countries.find((candidate) => candidate.id === place.locationCountryId)
  const primary = images.find((image) => image.isPrimary) ?? images[0]
  const isSaved = isAuthenticated && saved.isSaved(place.id)

  const save = () => {
    if (isAuthenticated) return saved.toggle(place.id)
    const state: ReturnState = { from: { pathname: location.pathname, search: location.search } }
    navigate(ROUTES.signIn, { state })
  }

  const side = (
    <Card padding="lg" className="flex flex-col gap-4.5">
      <PlaceActions place={place} />
      <Divider />
      <PlaceContacts place={place} />
      {place.languages.length > 0 && (
        <Section title={t('place.languages')} size="sm" as="h2">
          <ul aria-label={t('place.languages')} className="m-0 flex list-none flex-wrap gap-1.5 p-0">
            {place.languages.map((language) => (
              <li key={language}>
                <Tag>{language}</Tag>
              </li>
            ))}
          </ul>
        </Section>
      )}
      <PlaceMiniMap place={place} type={type} />
    </Card>
  )

  return (
    <Shell
      phone={phone}
      title={place.name}
      onBack={onBack}
      trailing={<IconButton icon="bookmark" pressed={isSaved} label={t(isSaved ? 'map.unsave' : 'map.save', { name: place.name })} onClick={save} />}
    >
      {!phone && (
        <nav aria-label={t('place.breadcrumbs')} className="flex h-13 items-center gap-2.5 border-b border-border-1 bg-surface px-8 text-label font-medium text-ink-3">
          <TextLink to={ROUTES.map} icon="arrowLeft" tone="muted">
            {t('place.map')}
          </TextLink>
          {country && (
            <>
              <Icon name="chevronRight" size={11} />
              <span>{country.name}</span>
            </>
          )}
          <Icon name="chevronRight" size={11} />
          <span aria-current="page" className="min-w-0 truncate text-ink-1">
            {place.name}
          </span>
        </nav>
      )}
      {primary && <ImageFrame src={primary.url} alt={t('place.photos.primary', { name: place.name })} ratio="banner" rounded={false} className="max-h-65 w-full" />}
      <div className="mx-auto flex w-full max-w-295 flex-col gap-7 px-4.5 pt-5 pb-8 md:px-8 md:pt-7 md:pb-12 lg:flex-row lg:items-start lg:gap-12 lg:pt-8 lg:pb-16">
        <div className="flex min-w-0 flex-1 flex-col gap-7.5">
          <PlaceHead place={place} type={type} />
          {!wide && side}
          {place.description && (
            <Section title={t('place.about')} as="h2">
              <p className="m-0 max-w-165 text-md font-medium text-pretty text-ink-2">{place.description}</p>
            </Section>
          )}
          {place.services.length > 0 && (
            <Section title={t('place.services')} as="h2">
              <ul aria-label={t('place.services')} className="m-0 flex list-none flex-wrap gap-1.75 p-0">
                {place.services.map((service) => (
                  <li key={service}>
                    <Tag size="md">{service}</Tag>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {images.length > 0 && (
            <Section title={t('place.photos.title', { count: images.length })} as="h2">
              <PlacePhotos images={images} placeName={place.name} />
            </Section>
          )}
          {place.openingHours && (
            <Section title={t('place.hours')} as="h2">
              <PlaceHours place={place} />
            </Section>
          )}
          <ConsularNetwork organisationId={place.id}>
            {(links) => (
              <Section title={t('place.network.title')} subtitle={t('place.network.subtitle')} as="h2">
                {links}
              </Section>
            )}
          </ConsularNetwork>
          {place.community && (
            <Section title={t('place.community.title')} subtitle={t('place.community.subtitle')} as="h2">
              <PlaceCommunity community={place.community} />
            </Section>
          )}
          <Section title={t('place.reviews.title')} as="h2">
            <PlaceReviews organisationId={place.id} limit={phone ? PAGE_REVIEWS.phone : PAGE_REVIEWS.wide} compact={phone} />
          </Section>
          {(place.creator || place.locationSource === 'google') && (
            <Section title={t('place.addedBy.title')} as="h2">
              <PlaceAddedBy place={place} />
            </Section>
          )}
        </div>
        {wide && <aside className="lg:sticky lg:top-5 lg:w-90 lg:shrink-0">{side}</aside>}
      </div>
    </Shell>
  )
}
