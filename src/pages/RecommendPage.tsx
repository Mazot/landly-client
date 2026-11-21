import { compact } from 'es-toolkit'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { RecommendForm } from '@/components/people/RecommendForm'
import { InlineStatus, MobileHeader, PageHeader } from '@/components/ui'
import { useCurrentCorridor } from '@/hooks/useCurrentCorridor'
import { ROUTES } from '@/lib/routes'
import { useBreakpoint } from '@/lib/useBreakpoint'

/**
 * Recommend someone (signed in): the form, then the claim link to send. The person's profile stays
 * hidden until they confirm it from that link; a moderator looks at the recommendation first.
 */
export default function RecommendPage() {
  return (
    <AppShell>
      <RecommendScreen />
    </AppShell>
  )
}

function RecommendScreen() {
  const { t } = useTranslation()
  const size = useBreakpoint()
  const navigate = useNavigate()
  const { from, to, isPending } = useCurrentCorridor()
  const phone = size === 'phone'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {phone && <MobileHeader back="close" onBack={() => navigate(ROUTES.people)} title={t('recommend.title')} />}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-170 px-4.5 pt-4.5 pb-6 md:px-9 md:pt-8 md:pb-10">
          {!phone && <PageHeader eyebrow={t('recommend.eyebrow')} title={t('recommend.title')} size="lg" className="mb-2" />}
          <p className="m-0 mb-6 text-sm font-medium text-ink-3">{t('recommend.lede')}</p>
          {isPending ? <InlineStatus>{t('recommend.loading')}</InlineStatus> : <RecommendForm countryId={to?.id} countryIds={compact([from?.id, to?.id])} onDone={() => navigate(ROUTES.account)} />}
        </div>
      </div>
    </div>
  )
}
