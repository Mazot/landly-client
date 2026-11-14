import { compact } from 'es-toolkit'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { FormTextField } from '@/components/auth/FormTextField'
import { firstErrorKey } from '@/components/auth/schemas'
import { AVATAR_COLOR_KEYS, type AvatarColor } from '@/components/profile/avatarColors'
import { AVATAR_COLORS, Avatar, Button, Callout, ChipGroup, ColorSwatches, Divider, Field, KeyValueList, Segmented, Select, Tag, TextArea } from '@/components/ui'
import { useUiLocale } from '@/hooks/useUiLocale'
import { LOCALE_OPTIONS } from '@/lib/locales'
import { BIO_MAX_CHARS, CITY_MAX_CHARS, HERE_AS, LANGUAGE_IDS_MAX, NAME_MAX_CHARS, type Country, type Language, type UserProfile, type Uuid } from '@/types/api'
import { editProfileSchema, type EditProfileValues } from './schemas'

export interface EditProfileFormProps {
  /** `id` of the `<form>`, so a button outside it (the phone header's "Save") can submit it. */
  id: string
  profile: UserProfile
  /** Ids of the languages the user speaks now. */
  spokenLanguageIds: Uuid[]
  /** Every language and country to choose from. */
  languages: Language[]
  countries: Country[]
  /** Hides the bottom buttons: on a phone the header carries "Save" and the way back. */
  compact: boolean
  pending: boolean
  /** The last save was refused. */
  failed: boolean
  onCancel: () => void
  onSubmit: (values: EditProfileValues) => void
}

/** Edit profile: avatar colour, name, city, bio, home country, interface language, role and languages. */
export function EditProfileForm({ id, profile, spokenLanguageIds, languages, countries, compact: dense, pending, failed, onCancel, onSubmit }: EditProfileFormProps) {
  const { t } = useTranslation()
  // The language the UI is in now — it may have been switched in the top bar since the profile was saved.
  const uiLocale = useUiLocale()
  const defaultValues: EditProfileValues = {
    name: profile.name ?? '',
    city: profile.city ?? '',
    bio: profile.bio ?? '',
    homeCountryId: profile.homeCountryId ?? '',
    locale: uiLocale,
    hereAs: profile.hereAs ?? '',
    avatarColor: profile.avatarColor ?? '',
    languageIds: spokenLanguageIds,
  }
  const form = useForm({
    defaultValues,
    validators: { onSubmit: editProfileSchema },
    onSubmit: ({ value }) => onSubmit(value),
  })

  return (
    <form
      id={id}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
      className="flex flex-col gap-4"
    >
      {failed && <Callout tone="danger">{t('account.edit.failed')}</Callout>}
      <form.Subscribe selector={(state) => [state.values.name, state.values.avatarColor] as const}>
        {([name, avatarColor]) => (
          <div className="flex items-center gap-4">
            <Avatar name={name.trim() || profile.username} color={avatarColor || undefined} size="xl" />
            <form.Field name="avatarColor">
              {(field) => (
                <Field group label={t('auth.fields.avatarColor')}>
                  <ColorSwatches colors={AVATAR_COLORS} label={t('auth.fields.avatarColor')} value={field.state.value} onChange={field.handleChange} colorLabel={(color) => t(`auth.avatarColors.${AVATAR_COLOR_KEYS[color as AvatarColor]}`)} />
                </Field>
              )}
            </form.Field>
          </div>
        )}
      </form.Subscribe>
      <div className="grid gap-4 md:grid-cols-2">
        <form.Field name="name">{(field) => <FormTextField field={field} label={t('account.edit.fields.name')} maxLength={NAME_MAX_CHARS} autoComplete="name" />}</form.Field>
        <form.Field name="city">{(field) => <FormTextField field={field} label={t('account.edit.fields.city')} icon="pin" maxLength={CITY_MAX_CHARS} autoComplete="address-level2" />}</form.Field>
      </div>
      <form.Field name="bio">
        {(field) => {
          const error = firstErrorKey(field.state.meta.errors)
          return (
            <Field label={t('account.edit.fields.bio')} optional error={error && t(error)}>
              <TextArea rows={3} maxLength={BIO_MAX_CHARS} value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} />
            </Field>
          )
        }}
      </form.Field>
      <div className="grid gap-4 md:grid-cols-2">
        <form.Field name="homeCountryId">
          {(field) => (
            <Field label={t('account.edit.fields.homeCountry')}>
              <Select
                placeholder={t('account.edit.chooseCountry')}
                options={countries.map((country) => ({ value: country.id, label: compact([country.flag, country.name]).join(' ') }))}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </Field>
          )}
        </form.Field>
        <form.Field name="locale">
          {(field) => (
            <Field group label={t('auth.fields.locale')}>
              <Segmented block options={LOCALE_OPTIONS} label={t('auth.fields.locale')} value={field.state.value} onChange={field.handleChange} />
            </Field>
          )}
        </form.Field>
      </div>
      <form.Field name="hereAs">
        {(field) => (
          <Field group label={t('auth.fields.hereAs')}>
            <ChipGroup label={t('auth.fields.hereAs')} value={field.state.value || null} onChange={(value) => field.handleChange(value)} options={HERE_AS.map((value) => ({ value, label: t(`auth.hereAs.${value}`) }))} />
          </Field>
        )}
      </form.Field>
      <form.Field name="languageIds">
        {(field) => {
          const spoken = languages.filter((language) => field.state.value.includes(language.id))
          const rest = languages.filter((language) => !field.state.value.includes(language.id))
          return (
            <Field label={t('account.languages.title')}>
              <div className="flex flex-col gap-2.5">
                {spoken.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {spoken.map((language) => (
                      <Tag key={language.id} size="md" onRemove={() => field.handleChange(field.state.value.filter((languageId) => languageId !== language.id))}>
                        {language.name}
                      </Tag>
                    ))}
                  </div>
                )}
                {/* Always empty: picking a language adds it to the tags above. */}
                <Select
                  size="sm"
                  icon="plus"
                  aria-label={t('account.edit.addLanguage')}
                  placeholder={t('account.edit.addLanguage')}
                  options={rest.map((language) => ({ value: language.id, label: language.name }))}
                  value=""
                  disabled={field.state.value.length >= LANGUAGE_IDS_MAX || rest.length === 0}
                  onChange={(event) => field.handleChange([...field.state.value, event.target.value])}
                />
              </div>
            </Field>
          )
        }}
      </form.Field>
      <Divider />
      <KeyValueList
        card={false}
        items={[
          { label: t('auth.fields.email'), value: profile.email },
          { label: t('auth.fields.username'), value: `@${profile.username}` },
        ]}
      />
      {!dense && (
        <div className="flex justify-end gap-2.5">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="accent" loading={pending}>
            {t('account.edit.save')}
          </Button>
        </div>
      )}
    </form>
  )
}
