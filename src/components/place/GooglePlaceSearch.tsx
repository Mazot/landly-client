import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import { useDeferredValue, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Callout, List, ListItem, SearchField } from '@/components/ui'
import { queryKeys } from '@/lib/queryKeys'
import { searchTextFromMapsLink } from '@/lib/placeDraft'

/** Fewer characters than this ask Google nothing (every keystroke is a request). */
const MIN_QUERY_CHARS = 3

export interface GooglePick {
  placeId: string
  lat: number
  lng: number
}

export interface GooglePlaceSearchProps {
  /** Suggestions near this area first (the destination country). */
  bias?: google.maps.LatLngBoundsLiteral | null
  onPick: (pick: GooglePick) => void
}

/**
 * Find the place on Google Maps by name or address, or paste a Google Maps link. A pick gives the
 * Google place id and its point — nothing else from Google is kept (its terms allow storing only
 * the id). One Autocomplete session per pick: the suggestions are free, the pick's `location` is billed.
 */
export function GooglePlaceSearch({ bias, onPick }: GooglePlaceSearchProps) {
  const { t } = useTranslation()
  const places = useMapsLibrary('places')
  const [input, setInput] = useState('')
  // One billing session per pick: started by the first request after a pick (or ever), ended by the pick.
  const session = useRef<google.maps.places.AutocompleteSessionToken | undefined>(undefined)
  const query = useDeferredValue(searchTextFromMapsLink(input.trim()))

  const suggestions = useQuery({
    queryKey: queryKeys.googleSuggestions(query, bias ?? null),
    queryFn: async () => {
      const { suggestions } = await places!.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: query,
        sessionToken: (session.current ??= new places!.AutocompleteSessionToken()),
        ...(bias && { locationBias: bias }),
      })
      return suggestions.flatMap((suggestion) => (suggestion.placePrediction ? [suggestion.placePrediction] : []))
    },
    enabled: !!places && query.length >= MIN_QUERY_CHARS,
    placeholderData: keepPreviousData,
    structuralSharing: false,
  })

  const pick = async (prediction: google.maps.places.PlacePrediction) => {
    const place = prediction.toPlace()
    await place.fetchFields({ fields: ['location'] })
    const location = place.location
    setInput('')
    session.current = undefined
    if (location) onPick({ placeId: place.id, lat: location.lat(), lng: location.lng() })
  }

  const shown = query.length >= MIN_QUERY_CHARS ? (suggestions.data ?? []) : []
  return (
    <div className="flex flex-col gap-2">
      <SearchField
        aria-label={t('addPlace.google.search')}
        placeholder={t('addPlace.google.placeholder')}
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />
      {suggestions.isError && <Callout tone="danger" title={t('addPlace.google.failed')} />}
      {shown.length > 0 && (
        <List variant="divided" label={t('addPlace.google.suggestions')}>
          {shown.map((prediction) => (
            <ListItem key={prediction.placeId} size="sm" title={prediction.mainText?.text ?? prediction.text.text} subtitle={prediction.secondaryText?.text} onClick={() => void pick(prediction)} />
          ))}
        </List>
      )}
    </div>
  )
}
