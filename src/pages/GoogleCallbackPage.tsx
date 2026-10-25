import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout, Button, EmptyState, Spinner } from '@/components/ui'
import { AuthHero } from '@/components/auth/AuthHero'
import { useGoogleExchange } from '@/hooks/useAuth'
import { ROUTES } from '@/lib/routes'

/**
 * Where the server sends the browser after Google sign-in (`/auth/google/callback?code=…`).
 * Trades the single-use code for a session; a code is spent by its first use, so the
 * request goes out once even where React runs effects twice.
 */
export default function GoogleCallbackPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const code = params.get('code')
  const exchange = useGoogleExchange()
  const started = useRef(false)

  useEffect(() => {
    if (!code || started.current) return
    started.current = true
    exchange.mutate({ code }, { onSuccess: () => navigate(ROUTES.map, { replace: true }) })
  }, [code, exchange, navigate])

  const failed = !code || exchange.isError

  return (
    <AuthLayout aside={<AuthHero />} home={ROUTES.landing}>
      {failed ? (
        <EmptyState
          icon="google"
          tone="danger"
          title={t('auth.callback.failedTitle')}
          description={t('auth.callback.failedLede')}
          action={
            <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.signIn, { replace: true })}>
              {t('auth.callback.retry')}
            </Button>
          }
        />
      ) : (
        <div role="status" className="flex items-center gap-3 text-sm font-semibold text-ink-2">
          <Spinner />
          {t('auth.callback.working')}
        </div>
      )}
    </AuthLayout>
  )
}
