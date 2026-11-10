import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, ChipGroup, isKnownOrgType, Section, Sheet, type ChipOption } from '@/components/ui'
import { useSearchOrganisations } from '@/hooks/useOrganisations'
import { DEFAULT_FILTERS, filtersToQuery, LANGUAGE_FILTERS, RATING_FILTERS, type MapFilters } from '@/lib/mapFilters'
import type { SearchBox } from '@/lib/maps'
import { ADDED_BY, COSTS, SEARCH_SORTS, type AddedBy, type Cost, type OrganisationType, type SearchSort } from '@/types/api'

/** The most places one search answers with; the count on the button stops there. */
const COUNT_LIMIT = 200
/** The "Any" choice of a single-choice group: ChipGroup values are strings. */
const ANY = ''

export interface FiltersSheetProps {
  onClose: () => void
  /** The filters in force; the sheet edits a copy until "Show". */
  filters: MapFilters
  onApply: (filters: MapFilters) => void
  orgTypes: OrganisationType[]
  /** The area the list shows — the button counts the places a draft would find there. */
  area?: { box: SearchBox; center: google.maps.LatLngLiteral }
}

/**
 * Every filter of the map search in one sheet: type, languages, availability, rating, who added it,
 * cost and the sort order. Mount it while it is open (a fresh draft each time); "Show N places"
 * applies the draft, "Reset" clears it, closing drops it.
 */
export function FiltersSheet({ onClose, filters, onApply, orgTypes, area }: FiltersSheetProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState(filters)
  const set = (patch: Partial<MapFilters>) => setDraft((current) => ({ ...current, ...patch }))

  // What the draft would find in the area on the map: the same search as the list, one page of it.
  const found = useSearchOrganisations(area && { ...area.box, lat: area.center.lat, lng: area.center.lng, ...filtersToQuery(draft), limit: COUNT_LIMIT })
  const count = found.data?.items.length ?? null
  // A draft that has not been answered yet still shows the answer to the previous one: wait.
  const counted = count !== null && !found.isPlaceholderData ? count : null

  const typeOptions: ChipOption[] = orgTypes.flatMap((type) => (type.slug ? [{ value: type.slug, label: type.title ?? type.type, ...(isKnownOrgType(type.slug) && { orgType: type.slug }) }] : []))
  const languageOptions: ChipOption[] = LANGUAGE_FILTERS.map((name) => ({ value: name, label: t(`filters.lang.${name.toLowerCase()}`) }))
  const ratingOptions: ChipOption[] = [{ value: ANY, label: t('filters.any') }, ...RATING_FILTERS.map((value) => ({ value: String(value), label: `${value.toFixed(1)}+`, icon: 'star' as const }))]
  const addedByOptions: ChipOption[] = [{ value: ANY, label: t('filters.anyone') }, ...ADDED_BY.map((value) => ({ value, label: t(`addedBy.${value}`) }))]
  const costOptions: ChipOption[] = [{ value: ANY, label: t('filters.any') }, ...COSTS.map((value) => ({ value, label: t(`filters.${value === 'free' ? 'free' : 'paid'}`) }))]
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
        <Section size="sm" title={t('filters.languagesSpoken')}>
          <ChipGroup multiple label={t('filters.languagesSpoken')} options={languageOptions} value={draft.languages} onChange={(languages) => set({ languages })} />
        </Section>
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
        <Section size="sm" title={t('filters.cost')}>
          <ChipGroup label={t('filters.cost')} options={costOptions} value={draft.cost ?? ANY} onChange={(value) => set({ cost: value === ANY ? null : (value as Cost) })} />
        </Section>
        <Section size="sm" title={t('map.sortBy')}>
          <ChipGroup label={t('map.sortBy')} options={sortOptions} value={draft.sort} onChange={(value) => set({ sort: value as SearchSort })} />
        </Section>
      </div>
    </Sheet>
  )
}
