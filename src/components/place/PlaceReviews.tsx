import { useTranslation } from 'react-i18next'
import { Avatar, Callout, InlineStatus, List, ListItem, RatingBreakdown, Stars } from '@/components/ui'
import { useReviewSummary, useReviews } from '@/hooks/useReviews'
import { useUiLocale } from '@/hooks/useUiLocale'
import { formatAgo } from '@/lib/dates'
import type { Uuid } from '@/types/api'

export interface PlaceReviewsProps {
  organisationId: Uuid
  /** How many of the latest reviews to show. */
  limit: number
  /** Phones: the average without the per-rating bars. */
  compact?: boolean
}

/** The rating summary (average, stars, count, per-rating bars) and the latest reviews with their authors. */
export function PlaceReviews({ organisationId, limit, compact }: PlaceReviewsProps) {
  const { t, i18n } = useTranslation()
  const locale = useUiLocale()
  const target = { organisation_id: organisationId }
  const summary = useReviewSummary(target)
  const reviews = useReviews({ ...target, limit })

  if (summary.isError || reviews.isError) return <Callout tone="danger">{t('place.reviews.loadFailed')}</Callout>
  if (!summary.data || !reviews.data) return <InlineStatus>{t('place.loading')}</InlineStatus>
  if (summary.data.count === 0) return <p className="m-0 text-sm font-medium text-ink-3">{t('place.reviews.empty')}</p>

  const { count, byRating } = summary.data
  // With reviews the server always sends an average.
  const ratingAvg = summary.data.ratingAvg!
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="font-display text-display-lg text-ink-1">{ratingAvg.toLocaleString(i18n.resolvedLanguage, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
          <Stars value={ratingAvg} />
          <span className="text-xs font-medium text-ink-3">{t('place.reviews.count', { count })}</span>
        </div>
        {!compact && <RatingBreakdown className="flex-1" rows={byRating} label={t('place.reviews.breakdown')} rowLabel={(row) => t('place.reviews.bar', { count: row.count, rating: row.rating })} />}
      </div>
      <List label={t('place.reviews.latest')} variant="divided">
        {reviews.data.items.map((review) => {
          const name = review.author ? review.author.name || review.author.username : t('place.reviews.deletedAuthor')
          return (
            <ListItem
              key={review.id}
              align="top"
              leading={<Avatar name={name} color={review.author?.avatarColor} size="sm" />}
              title={name}
              adornment={<Stars value={review.rating} size={12} />}
              trailing={<span className="text-xs font-medium text-ink-4">{formatAgo(review.createdAt, locale)}</span>}
              footer={review.text ? <p className="m-0 text-sm font-medium text-pretty text-ink-2">{review.text}</p> : undefined}
            />
          )
        })}
      </List>
    </div>
  )
}
