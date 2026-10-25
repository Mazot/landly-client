import { useForm } from '@tanstack/react-form'
import { Trans, useTranslation } from 'react-i18next'
import { Button, Callout, Divider, Field, PageHeader, TextField, TextLink } from '@/components/ui'
import { useSignIn } from '@/hooks/useAuth'
import { ROUTES } from '@/lib/routes'
import { authFailure } from './authErrors'
import { GoogleButton } from './GoogleButton'
import { firstErrorKey, signInSchema } from './schemas'

/** Email + password sign-in (`POST /api/user/signin`) and Google. */
export function SignInForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation()
  const signIn = useSignIn()
  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: signInSchema },
    onSubmit: async ({ value }) => {
      signIn.reset()
      await signIn.mutateAsync({ email: value.email.trim(), password: value.password }).then(onSuccess, () => {})
    },
  })
  const failure = signIn.error ? authFailure(signIn.error) : undefined
  // Unknown email and wrong password are the same 401 — mark both fields, name neither.
  const rejected = failure === 'invalidCredentials'

  return (
    <div className="flex flex-col gap-4.5">
      <PageHeader as="h1" size="md" title={t('auth.signIn.title')} lede={t('auth.signIn.lede')} />
      <GoogleButton>{t('auth.google.signIn')}</GoogleButton>
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
        {failure && <Callout tone="danger">{t(`auth.errors.${failure}`)}</Callout>}
        <form.Field name="email">
          {(field) => {
            const key = firstErrorKey(field.state.meta.errors)
            return (
              <Field label={t('auth.fields.email')} error={key ? t(key) : undefined}>
                <TextField
                  icon="mail"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  invalid={!!key || rejected}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </Field>
            )
          }}
        </form.Field>
        <form.Field name="password">
          {(field) => {
            const key = firstErrorKey(field.state.meta.errors)
            return (
              <Field label={t('auth.fields.password')} error={key ? t(key) : undefined}>
                <TextField
                  type="password"
                  autoComplete="current-password"
                  invalid={!!key || rejected}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </Field>
            )
          }}
        </form.Field>
        <Button type="submit" variant="accent" size="lg" className="w-full" loading={signIn.isPending}>
          {t('auth.signIn.submit')}
        </Button>
      </form>
      <p className="m-0 text-center text-sm font-medium text-ink-3">
        <Trans i18nKey="auth.signIn.switch" components={{ cta: <TextLink to={ROUTES.signUp} tone="strong" size="md">link</TextLink> }} />
      </p>
      <p className="m-0 text-center text-label font-medium text-ink-3">
        <Trans i18nKey="auth.signIn.guest" components={{ cta: <TextLink to={ROUTES.landing} tone="muted">link</TextLink> }} />
      </p>
    </div>
  )
}
