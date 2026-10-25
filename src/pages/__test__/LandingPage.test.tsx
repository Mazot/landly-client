import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { useCorridorStore } from '@/stores/corridorStore'
import { country } from '@/test/factories'
import { renderApp } from '@/test/render'
import { API, capture, server } from '@/test/server'
import type { CountryDetail } from '@/types/api'
import LandingPage from '../LandingPage'

const russia = country({ name: 'Russia', flag: '🇷🇺' })
const germany = country({ name: 'Germany', flag: '🇩🇪' })
const ukraine = country({ name: 'Ukraine', flag: '🇺🇦' })

const detail = (c: typeof germany, totalPlaces: number): CountryDetail => ({
  ...c,
  totalPlaces,
  placesByType: [
    { slug: 'embassy', count: 4 },
    { slug: 'business', count: totalPlaces - 4 },
  ],
})
const orgTypes = [
  { id: '1', type: 'embassy', slug: 'embassy', title: 'Embassy', color: null },
  { id: '2', type: 'business', slug: 'business', title: 'Business', color: null },
]

function arrange(over: Record<string, CountryDetail> = {}) {
  const details: Record<string, CountryDetail> = { [germany.id]: detail(germany, 234), [ukraine.id]: detail(ukraine, 1), ...over }
  capture('get', '/api/common/countries', [russia, germany, ukraine])
  capture('get', '/api/common/org_types', orgTypes)
  server.use(http.get(`${API}/api/common/countries/:id`, ({ params }) => HttpResponse.json(details[params.id as string])))
}

function LeafPage({ name }: { name: string }) {
  return <p>{name}</p>
}

const page = () =>
  renderApp(
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/map" element={<p>the map</p>} />
      <Route path="/signin" element={<LeafPage name="sign-in page" />} />
      <Route path="/signup" element={<LeafPage name="sign-up page" />} />
    </Routes>,
  )

describe('LandingPage', () => {
  afterEach(() => useCorridorStore.setState({ fromId: null, toId: null }))

  it('introduces Landly and shows the destination’s live places with their type breakdown', async () => {
    arrange()
    page()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Embassies, businesses and helpers from home — wherever you live now.')
    expect(await screen.findByRole('button', { name: 'Open the map · 234 places' })).toBeEnabled()
    const legend = screen.getByRole('list', { name: 'Places by type' })
    expect(within(legend).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Embassy4', 'Business230'])
  })

  it('uses the slug when an org type has no title, and counts one place in the singular', async () => {
    arrange({ [germany.id]: { ...detail(germany, 1), placesByType: [{ slug: 'other', count: 1 }] } })
    page()
    expect(await screen.findByRole('button', { name: 'Open the map · 1 place' })).toBeInTheDocument()
    expect(within(screen.getByRole('list', { name: 'Places by type' })).getByText('other')).toBeInTheDocument()
  })

  it('refreshes the numbers when the destination changes', async () => {
    arrange()
    page()
    await screen.findByRole('button', { name: 'Open the map · 234 places' })

    await userEvent.selectOptions(screen.getByLabelText('Living in'), ukraine.id)

    expect(await screen.findByRole('button', { name: 'Open the map · 1 place' })).toBeInTheDocument()
  })

  it('saves the corridor and opens the map', async () => {
    arrange()
    page()
    await userEvent.click(await screen.findByRole('button', { name: /Open the map · 234/ }))

    expect(await screen.findByText('the map')).toBeInTheDocument()
    expect(useCorridorStore.getState()).toMatchObject({ fromId: russia.id, toId: germany.id })
  })

  it('cannot open the map while a side of the corridor is unknown', async () => {
    capture('get', '/api/common/countries', [ukraine])
    capture('get', '/api/common/org_types', orgTypes)
    page()
    await waitFor(() => expect(screen.getByLabelText('Living in')).toBeEnabled())
    expect(screen.getByRole('button', { name: 'Open the map' })).toBeDisabled()
    expect(screen.queryByRole('list', { name: 'Places by type' })).not.toBeInTheDocument()
  })

  it.each([
    ['Sign in', '/signin'],
    ['Sign up', '/signup'],
  ])('"%s" is a real link from the top bar (md+), and so is the phone footer one', (name, href) => {
    arrange()
    page()
    // Two per action: the top-bar one (shown from md) and the phone footer one; the phone header adds a third "Sign in".
    const links = screen.getAllByRole('link', { name })
    expect(links.length).toBeGreaterThanOrEqual(2)
    for (const link of links) expect(link).toHaveAttribute('href', href)
    expect(screen.queryByRole('button', { name })).not.toBeInTheDocument()
  })

  it('opens the sign-up page from the footer link', async () => {
    arrange()
    page()
    await userEvent.click(screen.getAllByRole('link', { name: 'Sign up' })[0])
    expect(await screen.findByText('sign-up page')).toBeInTheDocument()
  })

  it('reaches sign-in from the phone header link', async () => {
    arrange()
    page()
    await userEvent.click(screen.getAllByRole('link', { name: 'Sign in' })[0])
    expect(await screen.findByText('sign-in page')).toBeInTheDocument()
  })

  it('switches the language', async () => {
    arrange()
    page()
    await userEvent.selectOptions(screen.getByLabelText('Language'), 'ru')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Посольства, бизнес и помощники из дома')
    expect(await screen.findByRole('button', { name: 'Открыть карту · 234 места' })).toBeInTheDocument()
  })
})
