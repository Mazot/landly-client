import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { ClaimDecline } from '@/components/people/ClaimDecline'
import { ClaimForm } from '@/components/people/ClaimForm'
import { Button, EmptyState, IconTile, InlineStatus, Logo } from '@/components/ui'
import { useClaim } from '@/hooks/usePeople'
import { apiErrorStatus } from '@/lib/errors'
import { personPath, ROUTES } from '@/lib/routes'
import type { ClaimPreview } from '@/types/api'

/** The server's answers for a token it does not know, and for one that was used, expired or whose person already answered. */
const HTTP_NOT_FOUND = 404

/** What the person did on this page. It wins over the link's own state: the token is spent by the answer. */
type Outcome = { kind: 'confirmed'; preview: ClaimPreview } | { kind: 'declined' }

/**
 * Claim page (public — the token in the link is the credential): a recommended person checks what
 * was entered about them, chooses what is public and confirms (linking an account if they are signed
 * in) or declines. Nothing is public until they confirm.
 */
export default function ClaimPage() {
  const { t } = useTranslation()
  const { token = '' } = useParams()
  const claim = useClaim(token)
  const [outcome, setOutcome] = useState<Outcome>()

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="flex h-15 shrink-0 items-center border-b border-border-1 bg-surface px-4.5 pt-[env(safe-area-inset-top)] md:px-7">
        <Logo to={ROUTES.landing} />
      </header>
      <main className="flex flex-1 justify-center px-4.5 py-5 md:px-8 md:py-12">
        <div className="w-full md:max-w-140">{body()}</div>
      </main>
    </div>
  )

  function body(): ReactNode {
    if (outcome?.kind === 'confirmed') return <Done preview={outcome.preview} />
    if (outcome?.kind === 'declined') return <Declined />
    if (claim.isError) {
      const status = apiErrorStatus(claim.error)
      return (
        <EmptyState
          icon="link"
          tone={status === HTTP_NOT_FOUND ? 'neutral' : 'danger'}
          title={t(status === HTTP_NOT_FOUND ? 'claim.invalid.title' : status === undefined ? 'claim.loadFailed' : 'claim.used.title')}
          description={t(status === HTTP_NOT_FOUND ? 'claim.invalid.hint' : status === undefined ? 'claim.loadFailedHint' : 'claim.used.hint')}
          action={
            status === undefined ? (
              <Button variant="secondary" size="sm" onClick={() => void claim.refetch()}>
                {t('claim.retry')}
              </Button>
            ) : undefined
          }
        />
      )
    }
    if (!claim.data) return <InlineStatus>{t('claim.loading')}</InlineStatus>
    // Not moderated yet: the link already works for reading, but confirming is refused until a moderator approves.
    // Declining needs no moderator: the person can say no right away.
    if (claim.data.status === 'pending')
      return (
        <div className="flex flex-col gap-4.5">
          <EmptyState icon="flag" title={t('claim.pending.title')} description={t('claim.pending.hint', { name: claim.data.name })} />
          <ClaimDecline token={token} onDeclined={() => setOutcome({ kind: 'declined' })} />
        </div>
      )
    return <ClaimForm token={token} preview={claim.data} onConfirmed={(preview) => setOutcome({ kind: 'confirmed', preview })} onDeclined={() => setOutcome({ kind: 'declined' })} />
  }
}

function Done({ preview }: { preview: ClaimPreview }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-start gap-4">
      <IconTile icon="check" tone="success" size="lg" />
      <h1 className="m-0 font-display text-display-lg text-ink-1">{t('claim.done.title')}</h1>
      <p className="m-0 text-sm font-medium text-ink-3">{t(preview.status === 'claimed' ? 'claim.done.claimed' : 'claim.done.confirmed')}</p>
      <Button variant="accent" to={personPath(preview.id)}>
        {t('claim.done.view')}
      </Button>
    </div>
  )
}

function Declined() {
  const { t } = useTranslation()
  return <EmptyState icon="check" title={t('claim.declined.title')} description={t('claim.declined.hint')} />
}
