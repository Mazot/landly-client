import { useQuery } from '@tanstack/react-query'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import { queryKeys } from '@/lib/queryKeys'

/**
 * Live Google data shown next to an organisation. The field list decides the
 * billed Places SKU — request only what the screen renders.
 */
export const PLACE_DETAIL_FIELDS = [
  'id',
  'displayName',
  'formattedAddress',
  'location',
  'businessStatus',
  'rating',
  'userRatingCount',
  'regularOpeningHours',
  'photos',
  'googleMapsURI',
] as const

/**
 * Fetches `Organisation.googlePlaceId` from Google (Places API, new `Place`
 * class). Kept only in memory: Google's terms forbid storing these fields.
 */
export function usePlaceDetails(
  placeId: string | null | undefined,
  fields: readonly string[] = PLACE_DETAIL_FIELDS,
) {
  const places = useMapsLibrary('places')
  return useQuery({
    queryKey: queryKeys.googlePlace(placeId ?? '', fields),
    queryFn: async () => {
      const place = new places!.Place({ id: placeId! })
      await place.fetchFields({ fields: [...fields] })
      return place
    },
    enabled: !!places && !!placeId,
    staleTime: 30 * 60 * 1000,
    // Place is a class instance — skip React Query's structural sharing.
    structuralSharing: false,
  })
}
