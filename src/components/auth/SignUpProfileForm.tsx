import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { AVATAR_COLORS, Button, Callout, ChipGroup, ColorSwatches, Field, PageHeader, Select, StepBar, TextLink } from '@/components/ui'
import { CorridorPicker } from '@/components/corridor/CorridorPicker'
import { useGuestCorridor } from '@/hooks/useGuestCorridor'
import { useUiLocale } from '@/hooks/useUiLocale'
import { LOCALE_OPTIONS } from '@/lib/locales'
import { HERE_AS, type HereAs, type Locale, type SignUpRequest } from '@/types/api'
import { FormTextField } from './FormTextField'
import { signUpProfileSchema } from './schemas'
import type { AuthFailure } from './authErrors'
import type { AccountValues } from './SignUpAccountForm'

type AvatarColor = (typeof AVATAR_COLORS)[number]

/** i18n key (`auth.avatarColors.*`) of each swatch. */
const AVATAR_COLOR_KEYS: Record<AvatarColor, string> = { '#4A6D8C': 'blue', '#C7613F': 'terracotta', '#4F7F5C': 'green', '#8B5A8C': 'plum', '#B8814A': 'ochre', '#1B1A17': 'ink' }

export interface SignUpProfileFormProps {
  account: AccountValues
  pending?: boolean
  failure?: AuthFailure
  onBack: () => void
  onSubmit: (request: SignUpRequest) => void
}

/** Sign-up step 2 of 2: default corridor and profile — all optional, "Skip" sends the account alone. */
export function SignUpProfileForm({ account, pending, failure, onBack, onSubmit }: SignUpProfileFormProps) {
  const { t, i18n } = useTranslation()
  // A draft: picking here must not overwrite the guest corridor before the account is created.
  const corridor = useGuestCorridor({ persist: false })
  const uiLocale = useUiLocale()

  const base: SignUpRequest = { ...account, locale: uiLocale }
  const form = useForm({
    defaultValues: { name: '', hereAs: 'newcomer' as HereAs, locale: uiLocale as Locale, avatarColor: AVATAR_COLORS[0] as string },
    validators: { onSubmit: signUpProfileSchema },
    onSubmit: ({ value }) => {
      const name = value.name.trim()
      onSubmit({
        ...base,
        locale: value.locale,
        ...(name && { name }),
        here_as: value.hereAs,
        avatar_color: value.avatarColor,
        ...(corridor.ready && corridor.from && corridor.to && { home_country_id: corridor.from.id, corridor_from_country_id: corridor.from.id, corridor_to_country_id: corridor.to.id }),
      })
    },
  })

  return (
    <div className="flex flex-col gap-4.5">
      <div className="flex flex-col gap-2.5">
        <StepBar total={2} current={2} />
        <PageHeader
          as="h1"
          size="md"
          back={
            <TextLink icon="arrowLeft" tone="muted" onClick={onBack}>
              {t('auth.signUp.back')}
            </TextLink>
          }
          eyebrow={t('auth.signUp.step2')}
          title={t('auth.signUp.profileTitle')}
          lede={t('auth.signUp.profileLede')}
        />
      </div>
      {failure && <Callout tone="danger">{t(`auth.errors.${failure}`)}</Callout>}
      {corridor.isError && <Callout tone="warning">{t('corridor.loadFailed')}</Callout>}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        {/* Stacked on phones: country names ("United Kingdom") do not fit two to a row at 320–390 px. */}
        <CorridorPicker corridor={corridor} fromLabel={t('auth.fields.from')} toLabel={t('auth.fields.to')} stackOnPhone />
        <form.Field name="name">{(field) => <FormTextField field={field} label={t('auth.fields.name')} optional autoComplete="name" />}</form.Field>
        <form.Field name="hereAs">
          {(field) => (
            <Field label={t('auth.fields.hereAs')} optional>
              <ChipGroup label={t('auth.fields.hereAs')} value={field.state.value} onChange={field.handleChange} options={HERE_AS.map((value) => ({ value, label: t(`auth.hereAs.${value}`) }))} />
            </Field>
          )}
        </form.Field>
        <div className="grid gap-4 md:grid-cols-2">
          <form.Field name="locale">
            {(field) => (
              <Field label={t('auth.fields.locale')} optional>
                <Select
                  options={LOCALE_OPTIONS}
                  value={field.state.value}
                  onChange={(event) => {
                    const locale = event.target.value as Locale
                    field.handleChange(locale)
                    void i18n.changeLanguage(locale)
                  }}
                />
              </Field>
            )}
          </form.Field>
          <form.Field name="avatarColor">
            {(field) => (
              <Field label={t('auth.fields.avatarColor')} optional>
                <ColorSwatches label={t('auth.fields.avatarColor')} value={field.state.value} onChange={field.handleChange} colorLabel={(color) => t(`auth.avatarColors.${AVATAR_COLOR_KEYS[color as AvatarColor]}`)} />
              </Field>
            )}
          </form.Field>
        </div>
        <Button type="submit" variant="accent" size="lg" className="w-full" loading={pending}>
          {t('auth.signUp.submit')}
        </Button>
      </form>
      <div className="text-center">
        <TextLink tone="muted" size="md" onClick={() => !pending && onSubmit(base)}>
          {t('auth.signUp.skip')}
        </TextLink>
      </div>
    </div>
  )
}
