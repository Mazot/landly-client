import type { QueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

/**
 * Live-place summaries computed by the server from organisations: country
 * detail (`totalPlaces`, `placesByType`) and corridor stats. Refresh them
 * whenever an organisation becomes live, moves country or disappears.
 */
export function invalidatePlaceSummaries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.countries.details })
  queryClient.invalidateQueries({ queryKey: queryKeys.corridors.allStats })
}
