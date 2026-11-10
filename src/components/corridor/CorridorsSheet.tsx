import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Callout, CorridorFields, Field, List, Select, Sheet } from '@/components/ui'
import { useAllCountries, useOrganisationTypes } from '@/hooks/useCommon'
import { useCorridors, useCreateCorridor, useSetDefaultCorridor } from '@/hooks/useCorridors'
import { useCurrentCorridor } from '@/hooks/useCurrentCorridor'
import { useGuestCorridor } from '@/hooks/useGuestCorridor'
import { apiErrorConstraint } from '@/lib/errors'
import { useAuthStore } from '@/stores/authStore'
import { useCorridorStore } from '@/stores/corridorStore'
import type { Corridor, Country } from '@/types/api'
import { CorridorCard } from './CorridorCard'
import { CorridorPicker } from './CorridorPicker'

const countryOptions = (countries: Country[]) => countries.map((c) => ({ value: c.id, label: [c.flag, c.name].filter(Boolean).join('  ') }))

/**
 * The corridor picker, opened from the nav pill and the map's corridor summary. A signed-in user
 * sees their saved corridors (pick one to switch the map to it, make one the default, add one);
 * a guest just chooses the "from → to" pair. Mount it while it is open.
 */
export function CorridorsSheet({ onClose }: { onClose: () => void }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <MyCorridors onClose={onClose} /> : <GuestCorridor onClose={onClose} />
}

function GuestCorridor({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const corridor = useGuestCorridor()
  return (
    <Sheet
      open
      onClose={onClose}
      title={t('corridors.guestTitle')}
      subtitle={t('corridors.guestSubtitle')}
      footer={
        <Button variant="accent" block disabled={!corridor.ready} onClick={() => (corridor.commit(), onClose())}>
          {t('corridors.showMap')}
        </Button>
      }
    >
      <div className="pb-2">
        <CorridorPicker corridor={corridor} fromLabel={t('landing.from')} toLabel={t('landing.to')} stackOnPhone />
      </div>
    </Sheet>
  )
}

function MyCorridors({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const current = useCurrentCorridor()
  const saved = useCorridors()
  const { data: countries = [] } = useAllCountries()
  const orgTypes = useOrganisationTypes().data ?? []
  const setDefault = useSetDefaultCorridor()
  const create = useCreateCorridor()

  const corridors = saved.data?.items ?? []
  // The picked corridor: the user's click, until then the one the map shows (known once the list is loaded).
  const [pickedId, setPickedId] = useState<string>()
  const selectedId = pickedId ?? current.corridor?.id
  const selected = corridors.find((c) => c.id === selectedId)
  // The new corridor starts from where the user is already coming from.
  const [chosenFrom, setFrom] = useState<string>()
  const from = chosenFrom ?? current.from?.id ?? ''
  const [to, setTo] = useState('')
  const country = (id: string) => countries.find((c) => c.id === id)
  const options = countryOptions(countries)

  const switchTo = (corridor: Corridor) => {
    useCorridorStore.getState().setCorridor(corridor.fromCountryId, corridor.toCountryId)
    onClose()
  }
  const add = () =>
    create.mutate(
      { from_country_id: from, to_country_id: to },
      {
        onSuccess: (created) => {
          setPickedId(created.id)
          setTo('')
        },
      },
    )
  const addError = create.error && (apiErrorConstraint(create.error) === 'corridors_unique_per_user' ? t('corridors.errors.exists') : t('corridors.errors.generic'))
  const label = (corridor: Corridor) => t('corridorSwitcher.label', { from: country(corridor.fromCountryId)?.name ?? '', to: country(corridor.toCountryId)?.name ?? '' })

  return (
    <Sheet
      open
      onClose={onClose}
      title={t('corridors.title')}
      subtitle={t('corridors.subtitle')}
      footer={
        <Button variant="accent" block disabled={!selected || selected.id === current.corridor?.id} onClick={() => selected && switchTo(selected)}>
          {selected ? t('corridors.switchTo', { name: label(selected) }) : t('corridors.pick')}
        </Button>
      }
    >
      <div className="flex flex-col gap-3.5 pb-2">
        {saved.isError ? (
          <Callout tone="danger" title={t('corridors.loadFailed')} />
        ) : (
          corridors.length > 0 && (
            <List label={t('corridors.title')}>
              {corridors.map((corridor) => (
                <CorridorCard
                  key={corridor.id}
                  corridor={corridor}
                  from={country(corridor.fromCountryId)}
                  to={country(corridor.toCountryId)}
                  orgTypes={orgTypes}
                  selected={corridor.id === selectedId}
                  onSelect={(picked) => setPickedId(picked.id)}
                  onSetDefault={(picked) => setDefault.mutate(picked.id)}
                  settingDefault={setDefault.isPending && setDefault.variables === corridor.id}
                />
              ))}
            </List>
          )
        )}
        <section aria-label={t('corridors.addTitle')} className="flex flex-col gap-3 rounded-r3 border border-dashed border-border-2 p-3.5">
          <h3 className="m-0 text-sm font-bold">{t('corridors.addTitle')}</h3>
          <CorridorFields
            stackOnPhone
            from={
              <Field label={t('landing.from')}>
                <Select options={options} placeholder={t('corridor.choose')} disabled={!options.length} value={from} onChange={(event) => setFrom(event.target.value)} />
              </Field>
            }
            to={
              <Field label={t('corridors.destination')}>
                <Select options={options} placeholder={t('corridors.destination')} disabled={!options.length} value={to} onChange={(event) => setTo(event.target.value)} />
              </Field>
            }
          />
          {addError && <Callout tone="danger" title={addError} />}
          <Button variant="secondary" size="sm" icon="plus" loading={create.isPending} disabled={!from || !to || from === to} onClick={add}>
            {t('corridors.add')}
          </Button>
        </section>
      </div>
    </Sheet>
  )
}
