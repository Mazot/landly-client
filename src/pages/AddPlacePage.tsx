import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AddPlaceForm } from '@/components/place/AddPlaceForm'
import { InlineStatus, MobileHeader, PageHeader } from '@/components/ui'
import { useCurrentCorridor } from '@/hooks/useCurrentCorridor'
import { ROUTES } from '@/lib/routes'
import { useBreakpoint } from '@/lib/useBreakpoint'

/**
 * Add a place (signed in): the form, then the "sent for review" screen. New places start as
 * `pending` and appear on the map once a moderator approves them.
 */
export default function AddPlacePage() {
  return (
    <AppShell>
      <AddPlaceScreen />
    </AppShell>
  )
}

function AddPlaceScreen() {
  const { t } = useTranslation()
  const size = useBreakpoint()
  const navigate = useNavigate()
  const { from, to, isPending } = useCurrentCorridor()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {size === 'phone' && <MobileHeader back="close" onBack={() => navigate(ROUTES.map)} title={t('addPlace.title')} />}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-180 px-4.5 pt-4.5 pb-6 md:px-9 md:pt-8 md:pb-10 lg:max-w-280 lg:px-8 lg:pt-9 lg:pb-12">
          {size !== 'phone' && <PageHeader eyebrow={t('addPlace.eyebrow')} title={t('addPlace.title')} lede={t('addPlace.lede')} size="lg" className="mb-6.5" />}
          {isPending ? (
            <InlineStatus>{t('addPlace.loading')}</InlineStatus>
          ) : (
            <AddPlaceForm size={size} corridor={{ fromId: from?.id, toId: to?.id }} onCreated={(place, photos) => navigate(`${ROUTES.addSent}/${place.id}`, { replace: true, state: { photos } })} />
          )}
        </div>
      </div>
    </div>
  )
}
