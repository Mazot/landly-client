import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { EditProfileForm } from '@/components/account/EditProfileForm'
import type { EditProfileValues } from '@/components/account/schemas'
import { AppShell } from '@/components/layout/AppShell'
import { Button, EmptyState, InlineStatus, MobileHeader, PageHeader, TextLink } from '@/components/ui'
import { useAllCountries, useLanguages } from '@/hooks/useCommon'
import { useMe, useSaveProfile, useUserLanguages } from '@/hooks/useUser'
import { ROUTES } from '@/lib/routes'
import { useBreakpoint } from '@/lib/useBreakpoint'

/** Edit profile (signed in): what `/account` shows about you, plus the languages you speak. */
export default function EditProfilePage() {
  return (
    <AppShell>
      <EditProfileScreen />
    </AppShell>
  )
}

function EditProfileScreen() {
  const { t, i18n } = useTranslation()
  const size = useBreakpoint()
  const navigate = useNavigate()
  const formId = useId()
  const me = useMe()
  const spoken = useUserLanguages(me.data?.id)
  const countries = useAllCountries().data ?? []
  const languages = useLanguages().data ?? []
  const save = useSaveProfile()
  const back = () => navigate(ROUTES.account)

  /** `before` — the languages the server holds, to send only what changed. */
  const submit = (values: EditProfileValues, before: string[]) => {
    save.mutate(
      {
        profile: {
          name: values.name.trim(),
          city: values.city.trim(),
          bio: values.bio.trim(),
          locale: values.locale,
          ...(values.homeCountryId && { home_country_id: values.homeCountryId }),
          ...(values.hereAs && { here_as: values.hereAs }),
          ...(values.avatarColor && { avatar_color: values.avatarColor }),
        },
        addLanguageIds: values.languageIds.filter((id) => !before.includes(id)),
        removeLanguageIds: before.filter((id) => !values.languageIds.includes(id)),
      },
      {
        onSuccess: (profile) => {
          void i18n.changeLanguage(profile.locale)
          back()
        },
      },
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {size === 'phone' && (
        <MobileHeader
          back="back"
          onBack={back}
          title={t('account.edit.title')}
          trailing={
            <Button type="submit" form={formId} variant="ghost" size="sm" loading={save.isPending} disabled={!me.data || !spoken.data}>
              {t('account.edit.saveShort')}
            </Button>
          }
        />
      )}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex w-full max-w-170 flex-col gap-6 px-4 pt-4.5 pb-7 md:px-8 md:pt-8 md:pb-12 lg:pt-10 lg:pb-16">
          {size !== 'phone' && (
            <PageHeader
              size="md"
              back={
                <TextLink to={ROUTES.account} icon="arrowLeft" tone="muted">
                  {t('account.title')}
                </TextLink>
              }
              title={t('account.edit.title')}
            />
          )}
          {me.isError || spoken.isError ? (
            <EmptyState
              icon="flag"
              tone="danger"
              title={t('account.loadFailed')}
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    void me.refetch()
                    void spoken.refetch()
                  }}
                >
                  {t('account.retry')}
                </Button>
              }
            />
          ) : !me.data || !spoken.data ? (
            <InlineStatus>{t('account.loading')}</InlineStatus>
          ) : (
            <EditProfileForm
              id={formId}
              profile={me.data}
              spokenLanguageIds={spoken.data.languageIds}
              languages={languages}
              countries={countries}
              compact={size === 'phone'}
              pending={save.isPending}
              failed={save.isError}
              onCancel={back}
              onSubmit={(values) => submit(values, spoken.data.languageIds)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
