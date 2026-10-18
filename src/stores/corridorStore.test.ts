import { beforeEach, describe, expect, it } from 'vitest'
import { useCorridorStore } from './corridorStore'

describe('corridorStore (guest corridor)', () => {
  beforeEach(() => useCorridorStore.setState({ fromId: null, toId: null }))

  it('starts empty', () => {
    expect(useCorridorStore.getState()).toMatchObject({ fromId: null, toId: null })
  })

  it('sets the whole corridor or one side', () => {
    const store = useCorridorStore.getState()
    store.setCorridor('ru', 'de')
    expect(useCorridorStore.getState()).toMatchObject({ fromId: 'ru', toId: 'de' })

    store.setFrom('ua')
    store.setTo('pl')
    expect(useCorridorStore.getState()).toMatchObject({ fromId: 'ua', toId: 'pl' })
  })

  it('swaps from and to', () => {
    useCorridorStore.getState().setCorridor('ru', 'de')
    useCorridorStore.getState().swap()
    expect(useCorridorStore.getState()).toMatchObject({ fromId: 'de', toId: 'ru' })
  })

  it('persists under landly-corridor-v2', () => {
    useCorridorStore.getState().setCorridor('ru', 'de')
    expect(JSON.parse(localStorage.getItem('landly-corridor-v2')!).state).toMatchObject({ fromId: 'ru', toId: 'de' })
  })
})
