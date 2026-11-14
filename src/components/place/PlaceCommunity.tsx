import { useTranslation } from 'react-i18next'
import { Card, Stat } from '@/components/ui'
import { useUiLocale } from '@/hooks/useUiLocale'
import { formatAgo } from '@/lib/dates'
import type { CommunitySignals } from '@/types/api'

export interface PlaceCommunityProps {
  community: CommunitySignals
}

/** Check-ins: how many say the place is still active, how many came, the latest one, and their tips. */
export function PlaceCommunity({ community }: PlaceCommunityProps) {
  const { t } = useTranslation()
  const locale = useUiLocale()
  if (community.peopleCame === 0) return <p className="m-0 text-sm font-medium text-ink-3">{t('place.community.empty')}</p>

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
        {community.stillActivePct !== null && <Stat icon="check" value={`${community.stillActivePct}%`} label={t('place.community.stillActive')} />}
        <Stat icon="users" value={community.peopleCame} label={t('place.community.checkins', { count: community.peopleCame })} />
        {community.lastCheckinAt && <Stat icon="clock" value={formatAgo(community.lastCheckinAt, locale)} label={t('place.community.lastCheckin')} />}
      </div>
      {community.tips.length > 0 && (
        <ul aria-label={t('place.community.tips')} className="m-0 flex list-none flex-col gap-2 p-0">
          {community.tips.map((tip) => (
            <Card key={`${tip.createdAt}-${tip.text}`} as="li" variant="sunken" padding="sm">
              <p className="m-0 text-sm font-medium text-pretty text-ink-2">
                {t('place.community.tip', { text: tip.text })}{' '}
                <span className="text-ink-4">
                  {t('place.community.tipBy', { name: tip.author ? tip.author.name || tip.author.username : t('place.community.someone'), ago: formatAgo(tip.createdAt, locale) })}
                </span>
              </p>
            </Card>
          ))}
        </ul>
      )}
    </div>
  )
}
