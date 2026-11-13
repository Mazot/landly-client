import { vi } from 'vitest'

/** A suggestion the fake Places Autocomplete answers with: shown text and the place it resolves to. */
export interface FakeSuggestion {
  placeId: string
  main: string
  /** Google sent only the full text (no main/secondary split). */
  plain?: boolean
  /** A query suggestion, not a place: no `placePrediction`. */
  query?: boolean
  secondary?: string
  location?: { lat: number; lng: number }
}

/**
 * Stand-in for `useMapsLibrary('places')`: Autocomplete answers `suggestions` (or throws when
 * `fail`), a picked prediction resolves to its `location`, and `new Place({ id })` gets
 * `displayName` / `formattedAddress` from `details`. Calls are recorded on the returned mocks.
 */
export function fakePlaces({
  suggestions = [] as FakeSuggestion[],
  fail = false,
  details = {} as Record<string, { displayName: string; formattedAddress: string }>,
} = {}) {
  const prediction = (suggestion: FakeSuggestion) => ({
    placeId: suggestion.placeId,
    text: { text: suggestion.main },
    mainText: suggestion.plain ? null : { text: suggestion.main },
    secondaryText: suggestion.secondary ? { text: suggestion.secondary } : null,
    toPlace: () => {
      const place = {
        id: suggestion.placeId,
        location: undefined as { lat: () => number; lng: () => number } | undefined,
        fetchFields: vi.fn(async () => {
          if (suggestion.location) place.location = { lat: () => suggestion.location!.lat, lng: () => suggestion.location!.lng }
          return { place }
        }),
      }
      return place
    },
  })
  const fetchAutocompleteSuggestions = vi.fn(async () => {
    if (fail) throw new Error('Google is down')
    return { suggestions: suggestions.map((suggestion) => ({ placePrediction: suggestion.query ? null : prediction(suggestion) })) }
  })
  class Place {
    id: string
    displayName?: string
    formattedAddress?: string
    constructor({ id }: { id: string }) {
      this.id = id
    }
    async fetchFields() {
      Object.assign(this, details[this.id] ?? {})
      return { place: this }
    }
  }
  class AutocompleteSessionToken {}
  return { AutocompleteSuggestion: { fetchAutocompleteSuggestions }, AutocompleteSessionToken, Place }
}
