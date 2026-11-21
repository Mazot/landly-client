import { useTranslation } from 'react-i18next'
import { Avatar, Callout, Heading, InlineStatus, List, ListItem, RatingBreakdown, Stars, Text } from '@/components/ui'
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
  if (summary.data.count === 0) return <Text tone="muted">{t('place.reviews.empty')}</Text>

  const { count, byRating } = summary.data
  // With reviews the server always sends an average.
  const ratingAvg = summary.data.ratingAvg!
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <Heading as="span" size="display">{ratingAvg.toLocaleString(i18n.resolvedLanguage, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</Heading>
          <Stars value={ratingAvg} />
          <Text as="span" size="xs" tone="muted">
            {t('place.reviews.count', { count })}
          </Text>
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
              trailing={<Text as="span" size="xs" tone="faint">
                  {formatAgo(review.createdAt, locale)}
                </Text>}
              footer={review.text ? <Text>{review.text}</Text> : undefined}
            />
          )
        })}
      </List>
    </div>
  )
}
