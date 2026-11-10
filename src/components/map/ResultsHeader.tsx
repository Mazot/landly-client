import { useTranslation } from 'react-i18next'
import { ChipGroup, Select } from '@/components/ui'
import type { Breakpoint } from '@/lib/useBreakpoint'
import { SEARCH_SORTS, type SearchSort } from '@/types/api'

export interface ResultsHeaderProps {
  size: Breakpoint
  /** Places in the list; `null` while the first search is running. */
  count: number | null
  /** The server stopped at the page size, so there are more than `count`. */
  capped: boolean
  sort: SearchSort
  onSortChange: (sort: SearchSort) => void
}

/** Heading of the map results: how many places, and how they are ordered (chips, or a select on phones). */
export function ResultsHeader({ size, count, capped, sort, onSortChange }: ResultsHeaderProps) {
  const { t } = useTranslation()
  const sortOptions = SEARCH_SORTS.map((value) => ({ value, label: t(`map.sort.${value}`) }))
  const title = count === null ? t('map.loading') : capped ? t('map.countCapped', { count }) : t('map.count', { count })

  if (size === 'phone') {
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="text-lg font-bold">{count === null ? t('map.loading') : t('map.nearby', { count })}</span>
        <Select size="sm" aria-label={t('map.sortBy')} options={sortOptions} value={sort} onChange={(event) => onSortChange(event.target.value as SearchSort)} />
      </div>
    )
  }

  const chips = <ChipGroup size="sm" label={t('map.sortBy')} options={sortOptions} value={sort} onChange={onSortChange} />
  if (size === 'tablet') {
    return (
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
        <h2 className="m-0 text-lg font-bold">{title}</h2>
        {chips}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="m-0 text-xs font-bold tracking-wider text-ink-3 uppercase">{t('map.showingInArea')}</p>
        <h1 className="m-0 mt-1.5 text-2xl leading-tight font-bold">{title}</h1>
      </div>
      {chips}
    </div>
  )
}
