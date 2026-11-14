import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'

/** Paging of an own list: shown while the server may hold more. */
export interface ShowMoreProps {
  hasMore: boolean
  loading: boolean
  onMore: () => void
}

/** "Show more" under a list that loads the next page. */
export function ShowMore({ hasMore, loading, onMore }: ShowMoreProps) {
  const { t } = useTranslation()
  if (!hasMore) return null
  return (
    <div className="mt-3 flex justify-center">
      <Button variant="secondary" size="sm" loading={loading} onClick={onMore}>
        {t('account.showMore')}
      </Button>
    </div>
  )
}
