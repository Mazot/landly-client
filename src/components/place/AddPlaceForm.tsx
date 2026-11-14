import { useForm, useStore } from '@tanstack/react-form'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { FormTextField } from '@/components/auth/FormTextField'
import { firstErrorKey } from '@/components/auth/schemas'
import { PlaceListItem } from '@/components/map/PlaceListItem'
import { Button, Callout, Card, ChipGroup, CorridorFields, Field, isKnownOrgType, ListItem, Select, TextArea, type ChipOption } from '@/components/ui'
import { useAllCountries, useCountry, useOrganisationTypes, useTimeZone } from '@/hooks/useCommon'
import { useUploadImages } from '@/hooks/useImages'
import { useCreateOrganisation, useUpdateOrganisation } from '@/hooks/useOrganisations'
import { usePlaceDetails } from '@/hooks/usePlaceDetails'
import { apiErrorBodyText, apiErrorConstraint, apiErrorStatus } from '@/lib/errors'
import { geometryBounds } from '@/lib/maps'
import { emptyHours, isValidInterval, toCreateRequest, toFormValues, toUpdateRequest, type PlaceFormValues, type PlaceLocation } from '@/lib/placeDraft'
import type { Breakpoint } from '@/lib/useBreakpoint'
import { ADDRESS_MAX_CHARS, DESCRIPTION_MAX_CHARS, EMAIL_MAX_CHARS, ORG_NAME_MAX_CHARS, PHONE_MAX_CHARS, URL_MAX_CHARS, WEEKDAYS, type Organisation, type Uuid } from '@/types/api'
import { DuplicateHint } from './DuplicateHint'
import { GooglePlaceSearch } from './GooglePlaceSearch'
import { HoursEditor } from './HoursEditor'
import { LanguagesField } from './LanguagesField'
import { LocationPicker } from './LocationPicker'
import { PlacePhotosEditor, QueuedPhotos } from './PhotosField'
import { TagsField } from './TagsField'
import { placeSchema } from './schema'

/** Shown for a linked Google place: Google's own name and address (live, never sent to Landly). */
const LINKED_PLACE_FIELDS = ['displayName', 'formattedAddress'] as const
/** The server constraint behind "this Google place already has an organisation". */
const GOOGLE_PLACE_TAKEN = 'organisations_google_place_id_key'

export interface AddPlaceFormProps {
  size: Breakpoint
  /** The corridor the user is browsing: the place's countries until changed. */
  corridor?: { fromId: Uuid | undefined; toId: Uuid | undefined }
  /** The place was created; `photos` is how many of the picked photos were sent and how many were refused. */
  onCreated?: (place: Organisation, photos: { uploaded: number; failed: number }) => void
  /** Edit mode: the place being changed (`PUT /organisation/update/{id}`); its values fill the form. */
  place?: Organisation
  onSaved?: (place: Organisation) => void
}

/**
 * "Add a place" (`POST /organisation/create` → `pending`). The point comes from a Google Maps pick
 * (its id is linked, nothing else of Google's is sent) or a pin set on the map; the countries are the
 * corridor's. Desktop keeps the map, a preview and the submit button in a sticky side card.
 * With `place` it edits that place instead: no Google search (the link stays as it is), the pin can
 * still be moved, and saving sends the changes (a live place goes back to review on the server).
 */
export function AddPlaceForm({ size, corridor, onCreated, place, onSaved }: AddPlaceFormProps) {
  const { t } = useTranslation()
  const create = useCreateOrganisation()
  const update = useUpdateOrganisation()
  const uploadImages = useUploadImages()
  const saving = place ? update : create
  const [photos, setPhotos] = useState<File[]>([])
  const types = useOrganisationTypes().data ?? []
  const countries = useAllCountries().data ?? []
  const [location, setLocation] = useState<PlaceLocation | null>(place && place.latitude !== null && place.longitude !== null ? { lat: place.latitude, lng: place.longitude } : null)
  const [locationError, setLocationError] = useState(false)
  const [committedName, setCommittedName] = useState('')

  const form = useForm({
    defaultValues: (place ? toFormValues(place) : {
      name: '',
      typeId: '',
      address: '',
      tel: '',
      email: '',
      website: '',
      description: '',
      services: [],
      languages: [],
      hours: emptyHours(),
      fromId: corridor?.fromId ?? '',
      toId: corridor?.toId ?? '',
    }) as PlaceFormValues,
    validators: { onSubmit: placeSchema },
    onSubmit: ({ value }) => {
      if (!location) return setLocationError(true)
      if (place) return update.mutate({ id: place.id, body: toUpdateRequest(value, location, place) }, { onSuccess: (saved) => onSaved?.(saved) })
      create.mutate(toCreateRequest(value, location), {
        // The photos need the new place's id: they go up right after it exists, the first as the cover.
        onSuccess: async (created) => onCreated?.(created, photos.length ? await uploadImages.mutateAsync({ organisationId: created.id, files: photos }) : { uploaded: 0, failed: 0 }),
      })
    },
  })
  const values = useStore(form.store, (state) => state.values)
  // The schema reports bad hours on `hours.<day>`; the week shows one message once a submit was tried.
  const triedSubmit = useStore(form.store, (state) => state.submissionAttempts > 0)
  const badHours = triedSubmit && WEEKDAYS.some((day) => values.hours[day] !== null && !isValidInterval(values.hours[day]))

  const destination = useCountry(values.toId || undefined)
  const start = geometryBounds(destination.data?.geoJson)
  const point = location && { lat: location.lat, lng: location.lng }
  const zone = useTimeZone(point ?? undefined)
  const linked = usePlaceDetails(location?.googlePlaceId, LINKED_PLACE_FIELDS)

  const setPoint = (next: PlaceLocation) => {
    setLocation(next)
    setLocationError(false)
  }
  const type = types.find((candidate) => candidate.id === values.typeId)
  const typeOptions: ChipOption[] = types.map((candidate) => ({ value: candidate.id, label: candidate.title ?? candidate.type, ...(candidate.slug && isKnownOrgType(candidate.slug) && { orgType: candidate.slug }) }))
  const countryOptions = countries.map((country) => ({ value: country.id, label: [country.flag, country.name].filter(Boolean).join('  ') }))

  const failure = saving.error && submitFailure(saving.error, t)
  const desktop = size === 'desktop'

  const map = (
    <div className="h-56 overflow-hidden md:h-64">
      <LocationPicker value={point} onChange={(next) => setPoint({ ...next })} start={start} label={values.name} />
    </div>
  )
  const submit = (
    <div className="flex flex-col gap-2.5">
      {failure && <Callout tone="danger" title={failure} />}
      <Button type="submit" variant="accent" size="lg" className="w-full" loading={saving.isPending || uploadImages.isPending}>
        {place ? t('editPlace.submit') : t('addPlace.submit')}
      </Button>
    </div>
  )

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (!location) setLocationError(true)
        void form.handleSubmit()
      }}
      className="flex flex-col gap-12 lg:flex-row lg:items-start"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        {place?.status === 'live' && <Callout tone="warning" title={t('editPlace.reviewAgain')} />}
        {!place && (
          <Card padding="md">
            <Field label={t('addPlace.google.title')} hint={t('addPlace.google.hint')}>
              <GooglePlaceSearch bias={start} onPick={(pick) => setPoint({ lat: pick.lat, lng: pick.lng, googlePlaceId: pick.placeId })} />
            </Field>
            {location?.googlePlaceId && (
              <ListItem
                className="mt-3"
                size="sm"
                title={linked.data?.displayName ?? t('addPlace.google.linked')}
                subtitle={linked.data?.formattedAddress ?? undefined}
                trailing={
                  <Button variant="ghost" size="sm" onClick={() => setPoint({ lat: location.lat, lng: location.lng })}>
                    {t('addPlace.google.unlink')}
                  </Button>
                }
              />
            )}
          </Card>
        )}

        <form.Field name="name" listeners={{ onBlur: ({ value }) => setCommittedName(value) }}>
          {(field) => <FormTextField field={field} label={t('addPlace.fields.name')} placeholder={t('addPlace.placeholders.name')} maxLength={ORG_NAME_MAX_CHARS} autoComplete="off" />}
        </form.Field>
        {!place && <DuplicateHint name={committedName} point={point} />}

        <form.Field name="typeId">
          {(field) => (
            <Group label={t('addPlace.fields.type')} error={errorOf(field.state.meta.errors, t)}>
              <ChipGroup label={t('addPlace.fields.type')} options={typeOptions} value={field.state.value || null} onChange={(value) => field.handleChange(value)} />
            </Group>
          )}
        </form.Field>

        <CorridorFields
          stackOnPhone
          from={
            <form.Field name="fromId">
              {(field) => (
                <Field label={t('addPlace.fields.from')} error={errorOf(field.state.meta.errors, t)}>
                  <Select options={countryOptions} placeholder={t('corridor.choose')} value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} />
                </Field>
              )}
            </form.Field>
          }
          to={
            <form.Field name="toId">
              {(field) => (
                <Field label={t('addPlace.fields.to')} error={errorOf(field.state.meta.errors, t)}>
                  <Select options={countryOptions} placeholder={t('corridor.choose')} value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} />
                </Field>
              )}
            </form.Field>
          }
        />

        <div className="flex flex-col gap-2.5">
          <form.Field name="address">
            {(field) => (
              <FormTextField
                field={field}
                label={t('addPlace.fields.address')}
                hint={locationError ? undefined : t('addPlace.location.hint')}
                serverError={locationError ? t('addPlace.errors.location') : undefined}
                invalid={locationError}
                placeholder={t('addPlace.placeholders.address')}
                icon="pin"
                maxLength={ADDRESS_MAX_CHARS}
              />
            )}
          </form.Field>
          {!desktop && map}
        </div>

        <div className="grid gap-5 md:grid-cols-2 md:gap-3.5">
          <form.Field name="tel">{(field) => <FormTextField field={field} label={t('addPlace.fields.tel')} optional type="tel" icon="phone" autoComplete="off" maxLength={PHONE_MAX_CHARS} />}</form.Field>
          <form.Field name="email">{(field) => <FormTextField field={field} label={t('addPlace.fields.email')} optional type="email" icon="mail" autoComplete="off" maxLength={EMAIL_MAX_CHARS} />}</form.Field>
        </div>
        <form.Field name="website">{(field) => <FormTextField field={field} label={t('addPlace.fields.website')} optional type="url" icon="link" maxLength={URL_MAX_CHARS} />}</form.Field>
        <form.Field name="description">
          {(field) => (
            <Field label={t('addPlace.fields.description')} optional error={errorOf(field.state.meta.errors, t)}>
              <TextArea rows={3} maxLength={DESCRIPTION_MAX_CHARS} value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} />
            </Field>
          )}
        </form.Field>
        <form.Field name="services">
          {(field) => (
            <Group label={t('addPlace.fields.services')} hint={t('addPlace.services.hint')} error={errorOf(field.state.meta.errors, t)}>
              <TagsField label={t('addPlace.fields.services')} placeholder={t('addPlace.services.placeholder')} value={field.state.value} onChange={(services) => field.handleChange(services)} />
            </Group>
          )}
        </form.Field>
        <form.Field name="languages">
          {(field) => (
            <Group label={t('addPlace.fields.languages')} error={errorOf(field.state.meta.errors, t)}>
              <LanguagesField label={t('addPlace.fields.languages')} value={field.state.value} onChange={(languages) => field.handleChange(languages)} countryIds={[values.fromId, values.toId].filter(Boolean)} />
            </Group>
          )}
        </form.Field>
        <form.Field name="hours">
          {(field) => (
            <Group
              label={t('addPlace.fields.hours')}
              hint={zone.data ? t('addPlace.hours.timezone', { zone: zone.data }) : t('addPlace.hours.timezoneLater')}
              error={badHours ? t('addPlace.errors.hours') : undefined}
            >
              <HoursEditor value={field.state.value} onChange={(hours) => field.handleChange(hours)} />
            </Group>
          )}
        </form.Field>

        <Group label={t('addPlace.fields.photos')} hint={place ? t('photosField.savedAtOnce') : t('photosField.hint')}>
          {place ? <PlacePhotosEditor organisationId={place.id} /> : <QueuedPhotos files={photos} onChange={setPhotos} />}
        </Group>

        {!desktop && submit}
      </div>

      {desktop && (
        <aside className="sticky top-6 flex w-95 shrink-0 flex-col gap-4">
          <Card padding="none" className="overflow-hidden">
            {map}
            <div className="p-4.5">
              <PlaceListItem
                place={{ name: values.name.trim() || t('addPlace.preview.untitled'), status: place?.status ?? 'pending', verified: false, ratingAvg: null, reviewsCount: 0, city: null, openingHours: null, timezone: null, openNow: null }}
                type={type}
                active={false}
                compact={false}
              />
            </div>
          </Card>
          {submit}
        </aside>
      )}
    </form>
  )
}

/** A Field around a group of controls (chips, the week) — the label names the group, not one input. */
function Group({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <Field label={label} hint={hint} error={error}>
      {children}
    </Field>
  )
}

const errorOf = (errors: readonly unknown[], t: (key: string) => string) => {
  const key = firstErrorKey(errors)
  return key ? t(key) : undefined
}

/** What went wrong with the submission, in the user's words. */
function submitFailure(error: unknown, t: (key: string) => string): string {
  const status = apiErrorStatus(error)
  if (status === 429) return t('addPlace.errors.quota')
  if (status === 503) return t('addPlace.errors.googleDown')
  if (apiErrorConstraint(error) === GOOGLE_PLACE_TAKEN) return t('addPlace.errors.googleTaken')
  if (status === 422) return apiErrorBodyText(error) ?? t('addPlace.errors.generic')
  return t('addPlace.errors.generic')
}
