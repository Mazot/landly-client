import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { emptyHours, type DayHours } from '@/lib/placeDraft'
import { list, organisation } from '@/test/factories'
import { renderApp } from '@/test/render'
import { capture } from '@/test/server'
import { TAGS_PER_LIST_MAX, type Weekday } from '@/types/api'
import { DuplicateHint } from '../DuplicateHint'
import { HoursEditor } from '../HoursEditor'
import { LanguagesField } from '../LanguagesField'
import { TagsField } from '../TagsField'

function Hours({ initial = emptyHours(), onChange = vi.fn() }: { initial?: Record<Weekday, DayHours>; onChange?: (hours: Record<Weekday, DayHours>) => void }) {
  const [value, setValue] = useState(initial)
  return (
    <HoursEditor
      value={value}
      onChange={(next) => {
        setValue(next)
        onChange(next)
      }}
    />
  )
}

describe('HoursEditor', () => {
  it('lists the week closed, Monday first, in the UI language', () => {
    renderApp(<Hours />)
    const days = within(screen.getByRole('list', { name: 'Opening days' })).getAllByRole('listitem')
    expect(days.map((day) => day.textContent)).toEqual(['MonClosed', 'TueClosed', 'WedClosed', 'ThuClosed', 'FriClosed', 'SatClosed', 'SunClosed'])
  })

  it('opens a day empty, copies it to the next day switched on, and closes it again', async () => {
    const onChange = vi.fn()
    renderApp(<Hours onChange={onChange} />)
    await userEvent.click(screen.getByRole('switch', { name: 'Open on Mon' }))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ mon: ['', ''] }))

    fireEvent.change(screen.getByLabelText('Mon opens at'), { target: { value: '09:00' } })
    fireEvent.change(screen.getByLabelText('Mon closes at'), { target: { value: '18:00' } })
    await userEvent.click(screen.getByRole('switch', { name: 'Open on Wed' }))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ mon: ['09:00', '18:00'], tue: null, wed: ['09:00', '18:00'] }))

    await userEvent.click(screen.getByRole('switch', { name: 'Open on Mon' }))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ mon: null }))
    expect(screen.queryByLabelText('Mon opens at')).not.toBeInTheDocument()
  })

  it('marks a day that closes before it opens', () => {
    renderApp(<Hours initial={{ ...emptyHours(), mon: ['18:00', '09:00'], tue: ['09:00', ''] }} />)
    expect(screen.getByLabelText('Mon opens at')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Mon closes at')).toHaveAttribute('aria-invalid', 'true')
    // An unfinished day is not wrong yet.
    expect(screen.getByLabelText('Tue opens at')).not.toHaveAttribute('aria-invalid')
  })
})

function Tags({ initial = [] as string[] }) {
  const [value, setValue] = useState(initial)
  return <TagsField label="Services" placeholder="e.g. Breakfast" value={value} onChange={setValue} />
}

describe('TagsField', () => {
  it('adds a tag with Enter or on leaving the input — trimmed, once — and removes one with a click', async () => {
    renderApp(<Tags initial={['Café']} />)
    await userEvent.click(screen.getByRole('button', { name: /Add/ }))
    const input = screen.getByRole('textbox', { name: 'e.g. Breakfast' })
    await userEvent.type(input, '  Breakfast {Enter}')
    await userEvent.type(input, 'café{Enter}')
    await userEvent.type(input, 'Catering')
    await userEvent.tab()
    const group = screen.getByRole('group', { name: 'Services' })
    expect(within(group).getAllByRole('button', { pressed: true }).map((chip) => chip.textContent)).toEqual(['Café', 'Breakfast', 'Catering'])
    // The input stays open after leaving it; Escape closes it.
    await userEvent.click(input)
    await userEvent.type(input, 'draft{Escape}')
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()

    await userEvent.click(within(group).getByRole('button', { name: 'Café' }))
    expect(within(group).queryByRole('button', { name: 'Café' })).not.toBeInTheDocument()
  })

  it('offers no "Add" once the list is full', () => {
    renderApp(<Tags initial={Array.from({ length: TAGS_PER_LIST_MAX }, (_, i) => `Service ${i}`)} />)
    expect(screen.queryByRole('button', { name: /^\+?\s*Add$/ })).not.toBeInTheDocument()
  })
})

function Languages({ initial = [] as string[], countryIds = ['ru', 'rs'] }) {
  const [value, setValue] = useState(initial)
  return <LanguagesField label="Languages spoken" value={value} onChange={setValue} countryIds={countryIds} />
}

describe('LanguagesField', () => {
  const serbian = { id: 'l-srp', name: 'Serbian', symbol: 'srp' }
  const russian = { id: 'l-rus', name: 'Russian', symbol: 'rus' }
  const german = { id: 'l-deu', name: 'German', symbol: 'deu' }

  it("offers the corridor's languages as chips and every other language in a picker", async () => {
    const byCountry = capture('get', '/api/common/languages', [russian, serbian])
    renderApp(<Languages initial={['English']} />)
    const group = await screen.findByRole('group', { name: 'Languages spoken' })
    await within(group).findByRole('button', { name: 'Serbian' })
    expect(within(group).getAllByRole('button').map((chip) => chip.textContent)).toEqual(['Russian', 'Serbian', 'English'])
    expect(byCountry[0].query.get('country_ids')).toBe('ru,rs')

    await userEvent.click(within(group).getByRole('button', { name: 'Russian' }))
    expect(within(group).getByRole('button', { name: 'Russian' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('adds a language picked from the full list', async () => {
    // The handler answers both requests: the corridor's languages and the full list.
    capture('get', '/api/common/languages', [german, russian])
    renderApp(<Languages countryIds={[]} />)
    const picker = await screen.findByRole('combobox', { name: 'Another language…' })
    await userEvent.selectOptions(picker, 'German')
    expect(screen.getByRole('group', { name: 'Languages spoken' })).toHaveTextContent('German')
    expect(screen.queryByRole('option', { name: 'German' })).not.toBeInTheDocument()
  })

  it('offers no picker once the list is full', async () => {
    capture('get', '/api/common/languages', [german])
    renderApp(<Languages countryIds={[]} initial={Array.from({ length: TAGS_PER_LIST_MAX }, (_, i) => `Lang ${i}`)} />)
    await screen.findByRole('group', { name: 'Languages spoken' })
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })
})

describe('DuplicateHint', () => {
  const point = { lat: 44.82, lng: 20.48 }

  it('names the like places nearby, and hides for that name on "It\'s different"', async () => {
    const twin = organisation({ name: 'Kyiv Coffee Kreuzberg', address: 'Oranienstraße 12', distanceKm: 0.43 })
    const requests = capture('get', '/api/organisation/duplicates', list([twin, organisation({ name: 'Kyiv Coffee', address: null })]))
    renderApp(<DuplicateHint name=" Kyiv Coffee " point={point} />)
    expect(await screen.findByText('A place with a similar name is 0.4 km away')).toBeInTheDocument()
    expect(screen.getByText('Kyiv Coffee Kreuzberg · Oranienstraße 12')).toBeInTheDocument()
    expect(screen.getByText('Kyiv Coffee')).toBeInTheDocument()
    expect(Object.fromEntries(requests[0].query)).toEqual({ name: 'Kyiv Coffee', lat: '44.82', lng: '20.48' })

    await userEvent.click(screen.getByRole('button', { name: "It's different" }))
    expect(screen.queryByText(/similar name/)).not.toBeInTheDocument()
  })

  it('asks nothing without a name or a point', async () => {
    const requests = capture('get', '/api/organisation/duplicates', list([]))
    renderApp(<DuplicateHint name="  " point={point} />)
    renderApp(<DuplicateHint name="Kyiv" point={null} />)
    expect(requests).toHaveLength(0)
  })

  it('shows nothing when nothing is alike', async () => {
    const requests = capture('get', '/api/organisation/duplicates', list([]))
    const { container } = renderApp(<DuplicateHint name="Unique" point={point} />)
    await vi.waitFor(() => expect(requests).toHaveLength(1))
    expect(container).toBeEmptyDOMElement()
  })

  it('reads a missing distance as 0', async () => {
    capture('get', '/api/organisation/duplicates', list([organisation({ name: 'Twin' })]))
    renderApp(<DuplicateHint name="Twin" point={point} />)
    expect(await screen.findByText('A place with a similar name is 0.0 km away')).toBeInTheDocument()
  })
})
