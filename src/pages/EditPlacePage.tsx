import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AddPlaceForm } from '@/components/place/AddPlaceForm'
import { Button, EmptyState, InlineStatus, MobileHeader, PageHeader } from '@/components/ui'
import { useOrganisation } from '@/hooks/useOrganisations'
import { apiErrorStatus } from '@/lib/errors'
import { placePath, ROUTES } from '@/lib/routes'
import { useBreakpoint } from '@/lib/useBreakpoint'
import { useAuthStore } from '@/stores/authStore'
import type { Organisation } from '@/types/api'

/** The server's answer for an id it does not know. */
const HTTP_NOT_FOUND = 404

/**
 * Edit a place (signed in): the add-a-place form filled with the place's values. Only for whoever
 * added it — anyone else, or a place the server does not know, gets "nothing here" (the server
 * checks again on save).
 */
export default function EditPlacePage() {
  return (
    <AppShell>
      <EditPlaceScreen />
    </AppShell>
  )
}

function EditPlaceScreen() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const size = useBreakpoint()
  const navigate = useNavigate()
  const userId = useAuthStore((state) => state.user?.id)
  const place = useOrganisation(id)
  // The form starts from the first answer of the server, not from a copy cached by the place page — and
  // keeps it: a later refetch (window focus) must not replace what the user is typing.
  const [loaded, setLoaded] = useState<Organisation>()
  if (!loaded && place.data && !place.isFetching) setLoaded(place.data)

  const leave = () => navigate(placePath(id))
  const header = size === 'phone' && <MobileHeader back="close" onBack={leave} title={t('editPlace.title')} />

  if (place.isError && !loaded) {
    const missing = apiErrorStatus(place.error) === HTTP_NOT_FOUND
    return (
      <div className="mx-auto w-full max-w-130 px-5 pt-5 md:px-10 md:pt-16">
        <EmptyState
          icon="pin"
          tone={missing ? 'neutral' : 'danger'}
          title={t(missing ? 'editPlace.notYours' : 'place.loadFailed')}
          description={missing ? t('editPlace.notYoursHint') : undefined}
          action={
            missing ? (
              <Button variant="secondary" size="sm" to={ROUTES.map}>
                {t('addPlace.sent.backToMap')}
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => void place.refetch()}>
                {t('place.retry')}
              </Button>
            )
          }
        />
      </div>
    )
  }
  if (!loaded) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {header}
        <InlineStatus>{t('editPlace.loading')}</InlineStatus>
      </div>
    )
  }
  if (loaded.createdBy !== userId) {
    return (
      <div className="mx-auto w-full max-w-130 px-5 pt-5 md:px-10 md:pt-16">
        <EmptyState
          icon="pin"
          title={t('editPlace.notYours')}
          description={t('editPlace.notYoursHint')}
          action={
            <Button variant="secondary" size="sm" to={ROUTES.map}>
              {t('addPlace.sent.backToMap')}
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {header}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-180 px-4.5 pt-4.5 pb-6 md:px-9 md:pt-8 md:pb-10 lg:max-w-280 lg:px-8 lg:pt-9 lg:pb-12">
          {size !== 'phone' && <PageHeader eyebrow={loaded.name} title={t('editPlace.title')} lede={t('editPlace.lede')} size="lg" className="mb-6.5" />}
          <AddPlaceForm size={size} place={loaded} onSaved={(saved) => navigate(placePath(saved.id), { replace: true })} />
        </div>
      </div>
    </div>
  )
}
