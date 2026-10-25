import { waitFor } from '@testing-library/react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderQueryHook } from '@/test/render'
import { PLACE_DETAIL_FIELDS, usePlaceDetails } from '../usePlaceDetails'

vi.mock('@vis.gl/react-google-maps', () => ({ useMapsLibrary: vi.fn() }))

/** Stand-in for google.maps.places.Place: records its id and requested fields. */
class FakePlace {
  static created: FakePlace[] = []
  fetchedFields: string[] = []
  constructor(public options: { id: string }) {
    FakePlace.created.push(this)
  }
  async fetchFields({ fields }: { fields: string[] }) {
    this.fetchedFields = fields
    return { place: this }
  }
}

const placesLibrary = { Place: FakePlace } as unknown as google.maps.PlacesLibrary

describe('usePlaceDetails', () => {
  beforeEach(() => {
    FakePlace.created = []
    vi.mocked(useMapsLibrary).mockReturnValue(placesLibrary)
  })

  it('waits until the Places library is loaded', () => {
    vi.mocked(useMapsLibrary).mockReturnValue(null)
    const { result } = renderQueryHook(() => usePlaceDetails('place-1'))
    expect(result.current.fetchStatus).toBe('idle')
    expect(useMapsLibrary).toHaveBeenCalledWith('places')
  })

  it('does nothing for an organisation without a Google place', () => {
    const { result } = renderQueryHook(() => usePlaceDetails(null))
    expect(result.current.fetchStatus).toBe('idle')
    expect(FakePlace.created).toHaveLength(0)
  })

  it('fetches the default detail fields live from Google', async () => {
    const { result } = renderQueryHook(() => usePlaceDetails('place-1'))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const [place] = FakePlace.created
    expect(place.options).toEqual({ id: 'place-1' })
    expect(place.fetchedFields).toEqual([...PLACE_DETAIL_FIELDS])
    // The Place instance itself is returned (no structural sharing copy).
    expect(result.current.data).toBe(place)
  })

  it('requests only the fields a screen asks for (they decide the billed SKU)', async () => {
    const { result } = renderQueryHook(() => usePlaceDetails('place-2', ['id', 'rating']))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(FakePlace.created[0].fetchedFields).toEqual(['id', 'rating'])
  })
})
