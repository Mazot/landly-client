import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_FILTERS, type MapFilters } from '@/lib/mapFilters'
import { list, organisation } from '@/test/factories'
import { renderApp } from '@/test/render'
import { API, server } from '@/test/server'
import type { OrganisationType } from '@/types/api'
import { FiltersSheet, type FiltersSheetProps } from '../FiltersSheet'

const types: OrganisationType[] = [
  { id: '1', type: 'embassy', slug: 'embassy', title: 'Embassy', color: null },
  { id: '2', type: 'business', slug: 'business', title: 'Business', color: null },
  { id: '3', type: 'choir', slug: 'choir', title: null, color: '#123456' },
  { id: '4', type: 'no slug', slug: null, title: 'No slug', color: null },
]
const area = { box: { min_lat: 52, max_lat: 53, min_lng: 13, max_lng: 14 }, center: { lat: 52.5, lng: 13.5 } }

/** Answers every search with `count` places and records the requests. */
function answer(count: (params: URLSearchParams) => number | 'error', spoken: string[][] = []) {
  const requests: URLSearchParams[] = []
  server.use(
    http.get(`${API}/api/organisation/search`, ({ request }) => {
      const params = new URL(request.url).searchParams
      requests.push(params)
      const n = count(params)
      return n === 'error' ? HttpResponse.json({ error: 'boom' }, { status: 500 }) : HttpResponse.json(list(Array.from({ length: n }, (_, i) => organisation({ languages: spoken.length ? spoken[i % spoken.length] : [] }))))
    }),
  )
  return requests
}

function setup(props: Partial<FiltersSheetProps> = {}) {
  const handlers = { onClose: vi.fn(), onApply: vi.fn() }
  renderApp(<FiltersSheet filters={DEFAULT_FILTERS} orgTypes={types} area={area} {...handlers} {...props} />)
  return handlers
}
const group = (name: string) => within(screen.getByRole('group', { name }))
const apply = /^Show/

describe('FiltersSheet', () => {
  it('is a sheet with a title and every filter group', async () => {
    // Three places in the area speak Russian twice, English and German once.
    answer(() => 3, [['Russian', 'English'], ['Russian'], ['German']])
    setup()
    await screen.findByRole('group', { name: 'Languages spoken' })
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument()
    expect(screen.getByText('Applies to the map and the list')).toBeInTheDocument()
    for (const name of ['Place type', 'Languages spoken', 'Availability', 'Minimum rating', 'Added by', 'Sort by']) {
      expect(screen.getByRole('group', { name })).toBeInTheDocument()
    }
    expect(group('Place type').getAllByRole('button').map((b) => b.textContent)).toEqual(['Embassy', 'Business', 'choir'])
    await waitFor(() => expect(group('Languages spoken').getAllByRole('button').map((b) => b.textContent)).toEqual(['Russian', 'English', 'German']))
    expect(group('Minimum rating').getAllByRole('button').map((b) => b.textContent)).toEqual(['Any', '3.5+', '4.0+', '4.5+'])
    expect(group('Added by').getAllByRole('button').map((b) => b.textContent)).toEqual(['Anyone', 'Official', 'Community', 'Volunteer'])
    expect(group('Sort by').getAllByRole('button').map((b) => b.textContent)).toEqual(['Nearest', 'Recently added', 'Verified first'])
    expect(await screen.findByRole('button', { name: 'Show 3 places' })).toBeInTheDocument()
  })

  it('starts from the filters in force', () => {
    answer(() => 1)
    const filters: MapFilters = { types: ['embassy', 'business'], languages: ['Russian'], openNow: true, verified: false, minRating: 4, addedBy: 'official', sort: 'verified' }
    setup({ filters })
    const pressed = (name: string) => group(name).getAllByRole('button', { pressed: true }).map((b) => b.textContent)
    expect(pressed('Place type')).toEqual(['Embassy', 'Business'])
    expect(pressed('Languages spoken')).toEqual(['Russian'])
    expect(pressed('Availability')).toEqual(['Open now'])
    expect(pressed('Minimum rating')).toEqual(['4.0+'])
    expect(pressed('Added by')).toEqual(['Official'])
    expect(pressed('Sort by')).toEqual(['Verified first'])
  })

  it('has "Any" choices pressed when a group is not filtered', () => {
    answer(() => 1)
    setup()
    expect(group('Minimum rating').getByRole('button', { name: 'Any' })).toHaveAttribute('aria-pressed', 'true')
    expect(group('Added by').getByRole('button', { name: 'Anyone' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('applies exactly what was picked', async () => {
    answer(() => 7, [['German']])
    const { onApply, onClose } = setup()
    await screen.findByRole('group', { name: 'Languages spoken' })
    await group('Languages spoken').findByRole('button', { name: 'German' })
    await userEvent.click(group('Place type').getByRole('button', { name: 'Embassy' }))
    await userEvent.click(group('Place type').getByRole('button', { name: 'choir' }))
    await userEvent.click(group('Languages spoken').getByRole('button', { name: 'German' }))
    await userEvent.click(group('Availability').getByRole('button', { name: 'Open now' }))
    await userEvent.click(group('Availability').getByRole('button', { name: 'Verified only' }))
    await userEvent.click(group('Minimum rating').getByRole('button', { name: '4.5+' }))
    await userEvent.click(group('Added by').getByRole('button', { name: 'Volunteer' }))
    await userEvent.click(group('Sort by').getByRole('button', { name: 'Recently added' }))
    await userEvent.click(await screen.findByRole('button', { name: apply }))
    expect(onApply).toHaveBeenCalledWith({ types: ['embassy', 'choir'], languages: ['German'], openNow: true, verified: true, minRating: 4.5, addedBy: 'volunteer', sort: 'recent' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('takes a choice back: types off, an "Any" choice again, availability off', async () => {
    answer(() => 7)
    const { onApply } = setup({ filters: { ...DEFAULT_FILTERS, types: ['embassy'], openNow: true, verified: true, minRating: 4, addedBy: 'official' } })
    await userEvent.click(group('Place type').getByRole('button', { name: 'Embassy' }))
    await userEvent.click(group('Availability').getByRole('button', { name: 'Open now' }))
    await userEvent.click(group('Minimum rating').getByRole('button', { name: 'Any' }))
    await userEvent.click(group('Added by').getByRole('button', { name: 'Anyone' }))
    await userEvent.click(await screen.findByRole('button', { name: apply }))
    expect(onApply).toHaveBeenCalledWith({ ...DEFAULT_FILTERS, verified: true })
  })

  it('resets the draft but keeps the order, and changes nothing until applied', async () => {
    answer(() => 7)
    const { onApply, onClose } = setup({ filters: { ...DEFAULT_FILTERS, types: ['embassy'], languages: ['Russian'], openNow: true, sort: 'verified' } })
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(group('Place type').queryAllByRole('button', { pressed: true })).toHaveLength(0)
    expect(group('Sort by').getByRole('button', { name: 'Verified first' })).toHaveAttribute('aria-pressed', 'true')
    expect(onApply).not.toHaveBeenCalled()
    await userEvent.click(await screen.findByRole('button', { name: apply }))
    expect(onApply).toHaveBeenCalledWith({ ...DEFAULT_FILTERS, sort: 'verified' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes without applying', async () => {
    answer(() => 7)
    const { onApply, onClose } = setup()
    await userEvent.click(group('Added by').getByRole('button', { name: 'Official' }))
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
    expect(onApply).not.toHaveBeenCalled()
  })

  describe('the count on the button', () => {
    it('counts what the draft finds in the area on the map, with the draft filters', async () => {
      const requests = answer((params) => (params.get('open_now') ? 4 : 21))
      setup()
      expect(await screen.findByRole('button', { name: 'Show 21 places' })).toBeEnabled()
      expect(Object.fromEntries(requests[0])).toEqual({ min_lat: '52', max_lat: '53', min_lng: '13', max_lng: '14', lat: '52.5', lng: '13.5', sort: 'nearest', limit: '200' })

      await userEvent.click(group('Availability').getByRole('button', { name: 'Open now' }))
      expect(await screen.findByRole('button', { name: 'Show 4 places' })).toBeInTheDocument()
      expect(requests[requests.length - 1].get('open_now')).toBe('true')
    })

    it('does not show the previous count for a draft that has not been answered yet', async () => {
      let release = () => {}
      const gate = new Promise<void>((resolve) => (release = resolve))
      server.use(
        http.get(`${API}/api/organisation/search`, async ({ request }) => {
          const params = new URL(request.url).searchParams
          if (params.get('added_by')) await gate
          return HttpResponse.json(list(Array.from({ length: params.get('added_by') ? 3 : 21 }, () => organisation())))
        }),
      )
      setup()
      await screen.findByRole('button', { name: 'Show 21 places' })
      await userEvent.click(group('Added by').getByRole('button', { name: 'Official' }))
      expect(screen.getByRole('button', { name: 'Show places' })).toBeInTheDocument()
      release()
      expect(await screen.findByRole('button', { name: 'Show 3 places' })).toBeInTheDocument()
    })

    it('uses the singular for one place', async () => {
      answer(() => 1)
      setup()
      expect(await screen.findByRole('button', { name: 'Show 1 place' })).toBeInTheDocument()
    })

    it('says nothing matches and does not offer to apply it', async () => {
      answer(() => 0)
      setup()
      expect(await screen.findByRole('button', { name: 'No places match' })).toBeDisabled()
    })

    it('adds a plus when the answer is a full page', async () => {
      answer(() => 200)
      setup()
      expect(await screen.findByRole('button', { name: 'Show 200+ places' })).toBeEnabled()
    })

    it('stays with "Show places" while loading, when the count fails, and without an area to count in', async () => {
      answer(() => 'error')
      const failing = setup()
      expect(screen.getByRole('button', { name: 'Show places' })).toBeEnabled()
      await waitFor(() => expect(screen.getByRole('button', { name: 'Show places' })).toBeEnabled())
      await userEvent.click(screen.getByRole('button', { name: 'Show places' }))
      expect(failing.onApply).toHaveBeenCalledWith(DEFAULT_FILTERS)
    })

    it('makes no request without an area', () => {
      const requests = answer(() => 5)
      setup({ area: undefined })
      expect(screen.getByRole('button', { name: 'Show places' })).toBeEnabled()
      expect(requests).toHaveLength(0)
    })
  })

  describe('the languages on offer', () => {
    it('are the ones the places in the area speak, most common first, ties by name', async () => {
      answer(() => 4, [['Serbian', 'Polish'], ['Polish'], ['Serbian'], ['Georgian']])
      setup()
      await waitFor(() => expect(group('Languages spoken').getAllByRole('button').map((b) => b.textContent)).toEqual(['Polish', 'Serbian', 'Georgian']))
    })

    it('are at most eight, and the chosen ones stay even when no place here speaks them', async () => {
      const names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
      answer(() => names.length, names.map((name) => [name]))
      setup({ filters: { ...DEFAULT_FILTERS, languages: ['Klingon'] } })
      await waitFor(() => expect(group('Languages spoken').getAllByRole('button')).toHaveLength(9))
      expect(group('Languages spoken').getByRole('button', { name: 'Klingon' })).toHaveAttribute('aria-pressed', 'true')
      expect(group('Languages spoken').queryByRole('button', { name: 'J' })).not.toBeInTheDocument()
    })

    it('are looked up without the language filter, so choosing one does not hide the others', async () => {
      const requests = answer(() => 2, [['Russian'], ['English']])
      setup()
      await screen.findByRole('group', { name: 'Languages spoken' })
      await group('Languages spoken').findByRole('button', { name: 'English' })
      await userEvent.click(group('Languages spoken').getByRole('button', { name: 'English' }))
      await waitFor(() => expect(requests.some((params) => params.get('languages') === 'English')).toBe(true))
      // The count asks for English only; the offer is always asked for every language.
      expect(group('Languages spoken').getByRole('button', { name: 'Russian' })).toBeInTheDocument()
      expect(requests.filter((params) => !params.has('languages')).length).toBeGreaterThan(0)
    })

    it('leave the group out when nobody here speaks anything and none is chosen', async () => {
      answer(() => 3)
      setup()
      await screen.findByRole('button', { name: 'Show 3 places' })
      expect(screen.queryByRole('group', { name: 'Languages spoken' })).not.toBeInTheDocument()
    })
  })

  it('leaves out the type group when there are no types with a slug', () => {
    answer(() => 1)
    setup({ orgTypes: [types[3]] })
    expect(screen.queryByRole('group', { name: 'Place type' })).not.toBeInTheDocument()
  })
})
