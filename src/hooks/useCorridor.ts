import { useEffect } from 'react'
import { useCountries } from './useReferences'
import { useCorridorStore } from '@/stores/corridorStore'
import type { Country } from '@/types/api'

/**
 * Resolves the active corridor (stored as country ids) against the server country
 * list, and lazily initializes a sensible default once countries are available.
 */
export function useCorridor() {
  const { data: countries } = useCountries()
  const store = useCorridorStore()
  const { fromId, toId, setCorridor } = store

  useEffect(() => {
    if (!countries || countries.length === 0) return
    // Validate stored IDs against the real list (guards against stale mock IDs in localStorage)
    const validFrom = countries.find((c) => c.id === fromId)?.id
    const validTo = countries.find((c) => c.id === toId)?.id
    if (validFrom && validTo) return
    const find = (n: string) => countries.find((c) => c.name.toLowerCase() === n)
    const f = validFrom ?? find('russia')?.id ?? countries[0]?.id
    const t = validTo ?? find('germany')?.id ?? countries[1]?.id ?? countries[0]?.id
    if (f && t) setCorridor(f, t)
  }, [countries, fromId, toId, setCorridor])

  const from = countries?.find((c) => c.id === fromId)
  const to = countries?.find((c) => c.id === toId)
  return { ...store, from, to, countries: (countries ?? []) as Country[] }
}
