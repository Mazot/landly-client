import { useForm } from '@tanstack/react-form'
import { Trans, useTranslation } from 'react-i18next'
import { Button, Divider, FormNote, PageHeader, StepBar, TextLink } from '@/components/ui'
import { PASSWORD_MIN_CHARS, USERNAME_MAX_CHARS, USERNAME_MIN_CHARS } from '@/types/api'
import { ROUTES } from '@/lib/routes'
import { GoogleButton } from './GoogleButton'
import { FormTextField } from './FormTextField'
import { signUpAccountSchema } from './schemas'

export interface AccountValues {
  username: string
  email: string
  password: string
}

export interface SignUpAccountFormProps {
  /** Kept when the user comes back from step 2. */
  defaultValues?: AccountValues
  /** The server refused this field's value (unique violation) — shown until the field is edited. */
  conflict?: 'username' | 'email'
  onEdit?: () => void
  onContinue: (values: AccountValues) => void
}

/** Sign-up step 1 of 2: username, email, password (validated here, sent with step 2). */
export function SignUpAccountForm({ defaultValues, conflict, onEdit, onContinue }: SignUpAccountFormProps) {
  const { t } = useTranslation()
  const form = useForm({
    defaultValues: defaultValues ?? { username: '', email: '', password: '' },
    validators: { onSubmit: signUpAccountSchema },
    onSubmit: ({ value }) => onContinue({ username: value.username.trim(), email: value.email.trim(), password: value.password }),
  })

  return (
    <div className="flex flex-col gap-4.5">
      <div className="flex flex-col gap-2.5">
        <StepBar total={2} current={1} />
        <PageHeader as="h1" size="md" eyebrow={t('auth.signUp.step1')} title={t('auth.signUp.accountTitle')} />
      </div>
      <GoogleButton>{t('auth.google.signUp')}</GoogleButton>
      <Divider label={t('auth.orWithEmail')} />
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        <form.Field name="username">
          {(field) => (
            <FormTextField
              field={field}
              label={t('auth.fields.username')}
              hint={t('auth.fields.usernameHint', { min: USERNAME_MIN_CHARS, max: USERNAME_MAX_CHARS })}
              serverError={conflict === 'username' ? t('auth.errors.usernameTaken') : undefined}
              onEdit={conflict === 'username' ? onEdit : undefined}
              icon="user"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
            />
          )}
        </form.Field>
        <form.Field name="email">
          {(field) => (
            <FormTextField
              field={field}
              label={t('auth.fields.email')}
              serverError={conflict === 'email' ? t('auth.errors.emailTaken') : undefined}
              onEdit={conflict === 'email' ? onEdit : undefined}
              icon="mail"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
            />
          )}
        </form.Field>
        <form.Field name="password">
          {(field) => <FormTextField field={field} label={t('auth.fields.password')} hint={t('auth.fields.passwordHint', { min: PASSWORD_MIN_CHARS })} type="password" autoComplete="new-password" />}
        </form.Field>
        <Button type="submit" variant="accent" size="lg" className="w-full" iconRight="arrowRight">
          {t('auth.signUp.continue')}
        </Button>
      </form>
      <FormNote>
        <Trans i18nKey="auth.signUp.switch" components={{ cta: <TextLink to={ROUTES.signIn} tone="strong" size="md">link</TextLink> }} />
      </FormNote>
    </div>
  )
}
