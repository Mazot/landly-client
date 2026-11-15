import { useForm, useStore } from '@tanstack/react-form'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FormTextField } from '@/components/auth/FormTextField'
import { firstErrorKey } from '@/components/auth/schemas'
import { Button, Callout, Checkbox, ChipGroup, Field, Segmented, TextArea } from '@/components/ui'
import { useCreatePerson, usePersonSkills } from '@/hooks/usePeople'
import { apiErrorBodyText, apiErrorStatus } from '@/lib/errors'
import { firstName } from '@/lib/text'
import { toCreatePersonRequest, type RecommendFormValues } from '@/lib/recommendDraft'
import { CITY_MAX_CHARS, EMAIL_MAX_CHARS, HANDLE_MAX_CHARS, LANGUAGE_IDS_MAX, PERSON_BIO_MAX_CHARS, PERSON_NAME_MAX_CHARS, type PersonCreated, type Uuid } from '@/types/api'
import { ClaimLinkSheet } from './ClaimLinkSheet'
import { SpokenLanguagesField } from './SpokenLanguagesField'
import { recommendSchema } from './schema'

/** What the server answers to too many recommendations. */
const HTTP_TOO_MANY = 429

export interface RecommendFormProps {
  /** The country the corridor leads to: where the helper is. */
  countryId: Uuid | undefined
  /** The corridor's countries: their languages are the "Speaks" choices. */
  countryIds: Uuid[]
  /** The claim link was handed over (the sheet was closed). */
  onDone: () => void
}

/**
 * "Recommend someone" (`POST /person/create` → `pending`): who they are, how they help (skills and
 * languages come from the backend), how to reach them and a consent. The answer carries the claim link,
 * shown in a sheet for the recommender to send — Landly sends nothing itself.
 */
export function RecommendForm({ countryId, countryIds, onDone }: RecommendFormProps) {
  const { t } = useTranslation()
  const create = useCreatePerson()
  const skills = usePersonSkills().data ?? []
  const [created, setCreated] = useState<PersonCreated>()

  const form = useForm({
    defaultValues: { name: '', city: '', bio: '', skills: [], languageIds: [], whatsapp: '', email: '', telegram: '', instagram: '', sendVia: 'whatsapp', consent: false } as RecommendFormValues,
    validators: { onSubmit: recommendSchema },
    onSubmit: ({ value }) => create.mutate(toCreatePersonRequest(value, countryId), { onSuccess: setCreated }),
  })
  const values = useStore(form.store, (state) => state.values)
  const errorOf = (errors: readonly unknown[]) => {
    const key = firstErrorKey(errors)
    return key ? t(key) : undefined
  }
  const failure = create.error && (apiErrorStatus(create.error) === HTTP_TOO_MANY ? t('recommend.errors.quota') : (apiErrorBodyText(create.error) ?? t('recommend.errors.generic')))
  const name = values.name.trim()

  return (
    <>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
        className="flex flex-col gap-5"
      >
        <form.Field name="name">{(field) => <FormTextField field={field} label={t('recommend.fields.name')} maxLength={PERSON_NAME_MAX_CHARS} autoComplete="off" />}</form.Field>
        <form.Field name="city">{(field) => <FormTextField field={field} label={t('recommend.fields.city')} optional icon="pin" maxLength={CITY_MAX_CHARS} autoComplete="off" />}</form.Field>
        <form.Field name="bio">
          {(field) => (
            <Field label={t('recommend.fields.bio')} optional error={errorOf(field.state.meta.errors)}>
              <TextArea rows={3} maxLength={PERSON_BIO_MAX_CHARS} value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} />
            </Field>
          )}
        </form.Field>
        {skills.length > 0 && (
          <form.Field name="skills">
            {(field) => (
              <Field label={t('recommend.fields.skills')} optional error={errorOf(field.state.meta.errors)}>
                <ChipGroup
                  multiple
                  label={t('recommend.fields.skills')}
                  options={skills.map((skill) => ({ value: skill.name, label: skill.name }))}
                  value={field.state.value}
                  onChange={(selected) => field.handleChange(selected)}
                />
              </Field>
            )}
          </form.Field>
        )}
        <form.Field name="languageIds">
          {(field) => (
            <Field label={t('recommend.fields.speaks')} optional error={errorOf(field.state.meta.errors)}>
              <SpokenLanguagesField label={t('recommend.fields.speaks')} value={field.state.value} onChange={(ids) => field.handleChange(ids)} countryIds={countryIds} max={LANGUAGE_IDS_MAX} />
            </Field>
          )}
        </form.Field>
        <div className="flex flex-col gap-2.5">
          <form.Field name="whatsapp">
            {(field) => <FormTextField field={field} label={t('recommend.fields.reach')} hint={t('recommend.reachHint')} icon="phone" type="tel" placeholder={t('recommend.placeholders.phone')} maxLength={HANDLE_MAX_CHARS} autoComplete="off" trailing={<span className="text-xs font-semibold text-ink-3">{t('recommend.whatsapp')}</span>} />}
          </form.Field>
          <form.Field name="email">
            {(field) => <FormTextField field={field} label={t('recommend.fields.email')} icon="mail" type="email" placeholder={t('recommend.placeholders.email')} maxLength={EMAIL_MAX_CHARS} autoComplete="off" />}
          </form.Field>
          <div className="grid gap-2.5 md:grid-cols-2">
            <form.Field name="telegram">
              {(field) => <FormTextField field={field} label={t('recommend.fields.telegram')} icon="link" placeholder={t('recommend.placeholders.telegram')} maxLength={HANDLE_MAX_CHARS} autoComplete="off" />}
            </form.Field>
            <form.Field name="instagram">
              {(field) => <FormTextField field={field} label={t('recommend.fields.instagram')} icon="image" placeholder={t('recommend.placeholders.instagram')} maxLength={HANDLE_MAX_CHARS} autoComplete="off" />}
            </form.Field>
          </div>
        </div>
        <form.Field name="sendVia">
          {(field) => (
            <Field label={t('recommend.fields.sendVia')} error={errorOf(field.state.meta.errors)}>
              <Segmented
                label={t('recommend.fields.sendVia')}
                options={[
                  { value: 'whatsapp', label: t('recommend.whatsapp') },
                  { value: 'email', label: t('recommend.email') },
                  { value: 'telegram', label: t('recommend.telegram') },
                  { value: 'instagram', label: t('recommend.instagram') },
                ]}
                value={field.state.value}
                onChange={(via) => field.handleChange(via)}
              />
            </Field>
          )}
        </form.Field>
        <form.Field name="consent">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <div className="rounded-r3 border border-border-1 bg-surface p-3.5">
                <Checkbox checked={field.state.value} onChange={(checked) => field.handleChange(checked)} label={t('recommend.consent.title', { name: firstName(name) || t('recommend.consent.they') })} description={t('recommend.consent.hint')} />
              </div>
              {errorOf(field.state.meta.errors) && (
                <p role="alert" className="m-0 text-label font-medium text-danger">
                  {errorOf(field.state.meta.errors)}
                </p>
              )}
            </div>
          )}
        </form.Field>
        {failure && <Callout tone="danger" title={failure} />}
        <Button type="submit" variant="accent" size="lg" className="w-full" loading={create.isPending}>
          {t('recommend.submit')}
        </Button>
      </form>
      <ClaimLinkSheet created={created} contacts={values} onClose={onDone} />
    </>
  )
}
