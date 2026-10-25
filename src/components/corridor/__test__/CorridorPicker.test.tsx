import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useGuestCorridor } from '@/hooks/useGuestCorridor'
import { useCorridorStore } from '@/stores/corridorStore'
import { country } from '@/test/factories'
import { renderApp } from '@/test/render'
import { capture } from '@/test/server'
import { CorridorPicker } from '../CorridorPicker'

function Picker() {
  const corridor = useGuestCorridor()
  return <CorridorPicker corridor={corridor} fromLabel="I'm from" toLabel="Living in" stackOnPhone />
}

describe('CorridorPicker', () => {
  const russia = country({ name: 'Russia', flag: '🇷🇺' })
  const germany = country({ name: 'Germany', flag: '🇩🇪' })

  it('shows disabled "Loading…" selects while the countries load', () => {
    capture('get', '/api/common/countries', [russia, germany])
    renderApp(<Picker />)
    expect(screen.getByLabelText("I'm from")).toBeDisabled()
    expect(screen.getAllByRole('option', { name: 'Loading…', hidden: true })).toHaveLength(2)
  })

  it('lists countries with their flags and preselects Russia → Germany', async () => {
    capture('get', '/api/common/countries', [russia, germany])
    renderApp(<Picker />)
    await waitFor(() => expect(screen.getByLabelText("I'm from")).toHaveValue(russia.id))
    expect(screen.getByLabelText('Living in')).toHaveValue(germany.id)
    expect(screen.getAllByRole('option', { name: '🇷🇺 Russia' })).toHaveLength(2)
  })

  it('saves a pick as the guest corridor', async () => {
    capture('get', '/api/common/countries', [russia, germany])
    renderApp(<Picker />)
    await waitFor(() => expect(screen.getByLabelText("I'm from")).toBeEnabled())

    await userEvent.selectOptions(screen.getByLabelText('Living in'), russia.id)

    expect(useCorridorStore.getState()).toMatchObject({ fromId: germany.id, toId: russia.id })
    useCorridorStore.setState({ fromId: null, toId: null })
  })

  it('offers "Choose a country" when nothing can be preselected', async () => {
    capture('get', '/api/common/countries', [])
    renderApp(<Picker />)
    expect(await screen.findAllByRole('option', { name: 'Choose a country', hidden: true })).toHaveLength(2)
    expect(screen.getByLabelText('Living in')).toBeDisabled()
  })
})
