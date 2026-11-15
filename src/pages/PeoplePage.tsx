import { useDeferredValue, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { ShowMore } from '@/components/account/ShowMore'
import { AppShell } from '@/components/layout/AppShell'
import { PeopleFilters } from '@/components/people/PeopleFilters'
import { PersonRow } from '@/components/people/PersonRow'
import { Button, Callout, EmptyState, Icon, InlineStatus, MobileHeader, PageHeader, Sheet } from '@/components/ui'
import { useCurrentCorridor } from '@/hooks/useCurrentCorridor'
import { useInfinitePeople } from '@/hooks/usePeople'
import { countActivePeopleFilters, parsePeopleFilters, serializePeopleFilters, toPeopleQuery, type PeopleFilters as Filters } from '@/lib/peopleFilters'
import { ROUTES } from '@/lib/routes'
import { useBreakpoint } from '@/lib/useBreakpoint'
import { compact } from 'es-toolkit'

/**
 * People (public): the helpers the community recommended and who confirmed their own profile, in the
 * corridor's destination country, narrowed by city, skills and spoken languages (kept in the URL).
 */
export default function PeoplePage() {
  return (
    <AppShell>
      <PeopleScreen />
    </AppShell>
  )
}

function PeopleScreen() {
  const { t } = useTranslation()
  const size = useBreakpoint()
  const [params, setParams] = useSearchParams()
  const { from, to, isPending: corridorPending } = useCurrentCorridor()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filters = parsePeopleFilters(params)
  const setFilters = (next: Filters) => setParams(serializePeopleFilters(next), { replace: true })
  // Typing a city asks the server once the typing pauses, and the list keeps its rows meanwhile.
  const city = useDeferredValue(filters.city)
  // Asked once the corridor is known: the list is the destination country's, not everyone's first.
  const people = useInfinitePeople(toPeopleQuery({ ...filters, city }, to?.id), undefined, !corridorPending)
  const rows = people.data ?? []
  const active = countActivePeopleFilters(filters)
  const countryIds = compact([from?.id, to?.id])
  const where = filters.city.trim() || to?.name

  const desktop = size === 'desktop'
  const phone = size === 'phone'
  const recommend = (
    <Button variant="accent" icon="plus" to={ROUTES.recommend} className={phone ? 'w-full' : undefined}>
      {t('people.recommend')}
    </Button>
  )
  const filtersButton = (
    <Button variant="secondary" size="sm" icon="sliders" onClick={() => setFiltersOpen(true)}>
      {active > 0 ? t('people.filters.withCount', { count: active }) : t('people.filters.title')}
    </Button>
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {phone && <MobileHeader title={t('people.heading')} subtitle={t('people.subheading')} trailing={filtersButton} />}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-295 px-4 py-3.5 md:px-7 md:py-7 lg:grid lg:grid-cols-[17.5rem_1fr] lg:items-start lg:gap-10 lg:px-8 lg:py-9">
          {desktop && (
            <aside aria-label={t('people.filters.title')}>
              <div className="mb-3 text-label font-semibold tracking-wider text-ink-3 uppercase">{t('people.filters.title')}</div>
              <PeopleFilters filters={filters} onChange={setFilters} countryIds={countryIds} />
            </aside>
          )}
          <div className="min-w-0">
            {!phone && (
              <div className="mb-5 flex items-end justify-between gap-5">
                <PageHeader eyebrow={t('people.eyebrow')} title={where ? t('people.title', { where }) : t('people.titleAnywhere')} size="lg" />
                <div className="flex shrink-0 gap-2">
                  {!desktop && filtersButton}
                  {recommend}
                </div>
              </div>
            )}
            <div className="mb-3.5 flex gap-2 rounded-r3 border border-border-1 bg-surface-2 px-3.5 py-2.75 text-label font-medium text-ink-3">
              <Icon name="verified" size={14} className="mt-px shrink-0 text-type-helper" />
              {t('people.trust')}
            </div>
            {people.isError ? (
              <Callout tone="danger">{t('people.loadFailed')}</Callout>
            ) : !people.data ? (
              <InlineStatus>{t('people.loading')}</InlineStatus>
            ) : rows.length === 0 ? (
              <EmptyState icon="users" title={t('people.empty')} description={t(active > 0 ? 'people.emptyFiltered' : 'people.emptyHint')} action={active > 0 ? undefined : recommend} />
            ) : (
              <>
                <ul aria-label={t('people.list')} className="m-0 grid list-none gap-2.5 p-0 lg:grid-cols-2">
                  {rows.map((person) => (
                    <li key={person.id} className="min-w-0">
                      <PersonRow person={person} compact={!desktop} />
                    </li>
                  ))}
                </ul>
                <ShowMore hasMore={people.hasNextPage} loading={people.isFetchingNextPage} onMore={() => void people.fetchNextPage()} />
              </>
            )}
            {phone && <div className="mt-4">{recommend}</div>}
          </div>
        </div>
      </div>
      <Sheet open={filtersOpen && !desktop} onClose={() => setFiltersOpen(false)} title={t('people.filters.title')} footer={<Button className="w-full" onClick={() => setFiltersOpen(false)}>{t('people.filters.show')}</Button>}>
        <PeopleFilters filters={filters} onChange={setFilters} countryIds={countryIds} />
      </Sheet>
    </div>
  )
}
