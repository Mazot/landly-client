import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, ChipGroup, Section, Sheet, type ChipOption } from '@/components/ui'
import { useSearchOrganisations } from '@/hooks/useOrganisations'
import { DEFAULT_FILTERS, filtersToQuery, RATING_FILTERS, type MapFilters } from '@/lib/mapFilters'
import type { SearchBox } from '@/lib/maps'
import { ADDED_BY, SEARCH_SORTS, type AddedBy, type OrganisationType, type SearchSort } from '@/types/api'
import { typeChipOptions } from './typeOptions'

/** The most places one search answers with; the count on the button stops there. */
const COUNT_LIMIT = 200
/** How many languages the sheet offers besides the chosen ones (the places in an area can speak dozens). */
const LANGUAGE_CHOICES = 8
/** The "Any" choice of a single-choice group: ChipGroup values are strings. */
const ANY = ''

export interface FiltersSheetProps {
  onClose: () => void
  /** The filters in force; the sheet edits a copy until "Show". */
  filters: MapFilters
  onApply: (filters: MapFilters) => void
  orgTypes: OrganisationType[]
  /** The area the list shows — the button counts the places a draft would find there. */
  area?: { box: SearchBox; center: google.maps.LatLngLiteral; /** The corridor the places belong to. */ destinationId?: string; originId?: string }
}

/**
 * Every filter of the map search in one sheet: type, languages, availability, rating, who added it,
 * and the sort order. Mount it while it is open (a fresh draft each time); "Show N places"
 * applies the draft, "Reset" clears it, closing drops it.
 */
export function FiltersSheet({ onClose, filters, onApply, orgTypes, area }: FiltersSheetProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState(filters)
  const set = (patch: Partial<MapFilters>) => setDraft((current) => ({ ...current, ...patch }))

  // What the draft would find in the area on the map: the same search as the list, one page of it.
  const found = useSearchOrganisations(area && { ...area.box, lat: area.center.lat, lng: area.center.lng, ...filtersToQuery(draft), location_country_id: area.destinationId, founder_country_id: area.originId, limit: COUNT_LIMIT })
  const count = found.data?.items.length ?? null
  // A draft that has not been answered yet still shows the answer to the previous one: wait.
  const counted = count !== null && !found.isPlaceholderData ? count : null

  // The languages on offer are the ones the places in this area speak (their `languages`), the most
  // common first — the same search without the language filter, so picking one does not hide the others.
  const pool = useSearchOrganisations(area && { ...area.box, lat: area.center.lat, lng: area.center.lng, ...filtersToQuery({ ...draft, languages: [] }), location_country_id: area.destinationId, founder_country_id: area.originId, limit: COUNT_LIMIT })
  const spoken = new Map<string, number>()
  for (const place of pool.data?.items ?? []) for (const name of place.languages) spoken.set(name, (spoken.get(name) ?? 0) + 1)
  const offered = [...spoken].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, LANGUAGE_CHOICES).map(([name]) => name)
  const languageNames = [...offered, ...draft.languages.filter((name) => !offered.includes(name))]

  const typeOptions = typeChipOptions(orgTypes)
  const languageOptions: ChipOption[] = languageNames.map((name) => ({ value: name, label: name }))
  const ratingOptions: ChipOption[] = [{ value: ANY, label: t('filters.any') }, ...RATING_FILTERS.map((value) => ({ value: String(value), label: `${value.toFixed(1)}+`, icon: 'star' as const }))]
  const addedByOptions: ChipOption[] = [{ value: ANY, label: t('filters.anyone') }, ...ADDED_BY.map((value) => ({ value, label: t(`addedBy.${value}`) }))]
  const sortOptions: ChipOption[] = SEARCH_SORTS.map((value) => ({ value, label: t(`map.sort.${value}`) }))
  const availability = [...(draft.openNow ? ['open'] : []), ...(draft.verified ? ['verified'] : [])]

  return (
    <Sheet
      open
      onClose={onClose}
      width="lg"
      title={t('filters.title')}
      subtitle={t('filters.subtitle')}
      footer={
        <>
          <Button variant="ghost" onClick={() => setDraft({ ...DEFAULT_FILTERS, sort: draft.sort })}>
            {t('filters.reset')}
          </Button>
          <Button variant="accent" block disabled={counted === 0} onClick={() => onApply(draft)}>
            {counted === null ? t('filters.show') : counted === 0 ? t('filters.showNone') : counted >= COUNT_LIMIT ? t('filters.showPlacesCapped', { count: counted }) : t('filters.showPlaces', { count: counted })}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5.5 pb-2">
        {typeOptions.length > 0 && (
          <Section size="sm" title={t('filters.placeType')}>
            <ChipGroup multiple solid label={t('filters.placeType')} options={typeOptions} value={draft.types} onChange={(types) => set({ types })} />
          </Section>
        )}
        {languageOptions.length > 0 && (
          <Section size="sm" title={t('filters.languagesSpoken')}>
            <ChipGroup multiple label={t('filters.languagesSpoken')} options={languageOptions} value={draft.languages} onChange={(languages) => set({ languages })} />
          </Section>
        )}
        <Section size="sm" title={t('filters.availability')}>
          <ChipGroup
            multiple
            label={t('filters.availability')}
            options={[
              { value: 'open', label: t('filters.openNow') },
              { value: 'verified', label: t('filters.verifiedOnly') },
            ]}
            value={availability}
            onChange={(next) => set({ openNow: next.includes('open'), verified: next.includes('verified') })}
          />
        </Section>
        <Section size="sm" title={t('filters.minRating')}>
          <ChipGroup label={t('filters.minRating')} options={ratingOptions} value={draft.minRating === null ? ANY : String(draft.minRating)} onChange={(value) => set({ minRating: value === ANY ? null : Number(value) })} />
        </Section>
        <Section size="sm" title={t('filters.addedBy')}>
          <ChipGroup label={t('filters.addedBy')} options={addedByOptions} value={draft.addedBy ?? ANY} onChange={(value) => set({ addedBy: value === ANY ? null : (value as AddedBy) })} />
        </Section>
        <Section size="sm" title={t('map.sortBy')}>
          <ChipGroup label={t('map.sortBy')} options={sortOptions} value={draft.sort} onChange={(value) => set({ sort: value as SearchSort })} />
        </Section>
      </div>
    </Sheet>
  )
}
