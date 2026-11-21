import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Callout, TextLink } from '@/components/ui'
import { useDeclineClaim } from '@/hooks/usePeople'

export interface ClaimDeclineProps {
  token: string
  onDeclined: () => void
}

/**
 * "This isn't me / decline", asked once more before it is sent. Offered in every state of the link
 * the server accepts a decline in — also while the recommendation is still in moderation.
 */
export function ClaimDecline({ token, onDeclined }: ClaimDeclineProps) {
  const { t } = useTranslation()
  const decline = useDeclineClaim(token)
  const [asking, setAsking] = useState(false)

  return (
    <div className="flex flex-col items-center gap-2.5 text-center">
      {decline.isError && <Callout tone="danger" title={t('claim.errors.generic')} className="w-full" />}
      {asking ? (
        <>
          <p className="m-0">{t('claim.decline.ask')}</p>
          <div className="flex gap-2.5">
            <Button variant="danger" size="sm" loading={decline.isPending} onClick={() => decline.mutate(undefined, { onSuccess: onDeclined })}>
              {t('claim.decline.yes')}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setAsking(false)}>
              {t('claim.decline.no')}
            </Button>
          </div>
        </>
      ) : (
        <TextLink tone="danger" onClick={() => setAsking(true)}>
          {t('claim.decline.link')}
        </TextLink>
      )}
    </div>
  )
}
