import { Suspense, type ReactNode } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import { Button, EmptyState, InlineStatus } from '@/components/ui'
import { redirectTo } from '@/lib/navigation'

/** Shown instead of a screen that failed to load (a page chunk gone after a deploy, no network) or to render. */
export function RouteFailed(_props: FallbackProps) {
  const { t } = useTranslation()
  return (
    <div className="mx-auto grid min-h-dvh w-full max-w-130 place-items-center px-5">
      <EmptyState
        icon="flag"
        tone="danger"
        title={t('app.failed')}
        description={t('app.failedHint')}
        action={
          <Button variant="secondary" size="sm" onClick={() => redirectTo(window.location.href)}>
            {t('app.reload')}
          </Button>
        }
      />
    </div>
  )
}

/**
 * Around the lazy pages: a centred "Loading…" while a page's code arrives, and a reload prompt when it
 * cannot (or the page crashes) — instead of a white screen.
 */
export function RouteBoundary({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <ErrorBoundary FallbackComponent={RouteFailed}>
      <Suspense
        fallback={
          <div className="grid min-h-dvh place-items-center">
            <InlineStatus>{t('app.loading')}</InlineStatus>
          </div>
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}
