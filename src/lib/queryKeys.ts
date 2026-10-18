import type {
  CountriesQuery,
  CountryConnectionsQuery,
  LanguagesQuery,
  ModerationQueueQuery,
  OrganisationsListQuery,
  PaginationParams,
  PeopleListQuery,
  ReviewsListQuery,
  SavedListQuery,
  SearchOrganisationsQuery,
  Uuid,
} from '@/types/api'

/**
 * React Query keys, one root per server feature. Invalidate a root
 * (e.g. `queryKeys.organisations.all`) to refetch everything below it.
 */
export const queryKeys = {
  me: ['me'] as const,
  userLanguages: (userId: Uuid) => ['user-languages', userId] as const,

  countries: {
    all: ['countries'] as const,
    list: (query?: CountriesQuery) => ['countries', 'list', query ?? {}] as const,
    infinite: (name: string) => ['countries', 'infinite', name] as const,
    /** Every country detail — they carry live-place counts. */
    details: ['countries', 'detail'] as const,
    detail: (id: Uuid) => ['countries', 'detail', id] as const,
  },
  organisationTypes: ['organisation-types'] as const,
  languages: (query?: LanguagesQuery) => ['languages', query ?? {}] as const,

  organisations: {
    all: ['organisations'] as const,
    list: (query?: OrganisationsListQuery) => ['organisations', 'list', query ?? {}] as const,
    search: (query: SearchOrganisationsQuery) => ['organisations', 'search', query] as const,
    detail: (id: Uuid) => ['organisations', 'detail', id] as const,
  },
  images: {
    all: ['images'] as const,
    list: (organisationId: Uuid, query?: PaginationParams) =>
      ['images', 'list', organisationId, query ?? {}] as const,
    byOrganisation: (organisationId: Uuid) => ['images', 'list', organisationId] as const,
    details: ['images', 'detail'] as const,
    detail: (id: Uuid) => ['images', 'detail', id] as const,
  },

  corridors: {
    all: ['corridors'] as const,
    list: ['corridors', 'list'] as const,
    /** Every corridor's stats — they carry live-place counts. */
    allStats: ['corridors', 'stats'] as const,
    stats: (id: Uuid) => ['corridors', 'stats', id] as const,
  },
  countryConnections: {
    all: ['country-connections'] as const,
    list: (query?: CountryConnectionsQuery) => ['country-connections', 'list', query ?? {}] as const,
    detail: (id: Uuid) => ['country-connections', 'detail', id] as const,
  },

  people: {
    all: ['people'] as const,
    lists: ['people', 'list'] as const,
    list: (query?: PeopleListQuery) => ['people', 'list', query ?? {}] as const,
    detail: (id: Uuid) => ['people', 'detail', id] as const,
    claim: (token: string) => ['people', 'claim', token] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    list: (query: ReviewsListQuery) => ['reviews', 'list', query] as const,
  },
  saved: {
    all: ['saved'] as const,
    list: (query?: SavedListQuery) => ['saved', 'list', query ?? {}] as const,
    counts: ['saved', 'counts'] as const,
  },
  moderation: {
    all: ['moderation'] as const,
    queue: (query?: ModerationQueueQuery) => ['moderation', 'queue', query ?? {}] as const,
  },

  /** Live Google Places data (never sent to the server). */
  googlePlace: (placeId: string, fields: readonly string[]) => ['google-place', placeId, fields] as const,
}
