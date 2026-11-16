import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Avatar, Button, Callout, Card, Section, Tag, TextLink, ToggleRow } from '@/components/ui'
import { useLanguages } from '@/hooks/useCommon'
import { useConfirmClaim, useDeclineClaim } from '@/hooks/usePeople'
import { apiErrorStatus } from '@/lib/errors'
import { claimPath, ROUTES, type ReturnState } from '@/lib/routes'
import { firstName } from '@/lib/text'
import { useAuthStore } from '@/stores/authStore'
import type { ClaimPreview } from '@/types/api'

/** What the server answers to the recommender confirming their own recommendation. */
const HTTP_FORBIDDEN = 403

export interface ClaimFormProps {
  token: string
  preview: ClaimPreview
  /** The answer of confirm: the person is `confirmed`, or `claimed` when an account was linked. */
  onConfirmed: (preview: ClaimPreview) => void
  onDeclined: () => void
}

/** The contacts and what they publish, in the order the page lists them. */
const CONTACTS = [
  { key: 'whatsapp', toggle: 'showWhatsapp' },
  { key: 'telegram', toggle: 'showTelegram' },
  { key: 'instagram', toggle: 'showInstagram' },
  { key: 'email', toggle: 'showEmail' },
] as const

/**
 * "Is this you?": the details the recommender entered, the privacy choices (what is public stays off
 * until the person turns it on) and the three ways out — confirm, confirm with an account, decline.
 * A signed-in visitor's confirmation links the profile to their account (the Bearer token goes along).
 */
export function ClaimForm({ token, preview, onConfirmed, onDeclined }: ClaimFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const username = useAuthStore((state) => state.user?.username)
  const languages = useLanguages().data ?? []
  const confirm = useConfirmClaim(token)
  const decline = useDeclineClaim(token)
  const [choices, setChoices] = useState({
    showWhatsapp: preview.showWhatsapp,
    showTelegram: preview.showTelegram,
    showInstagram: preview.showInstagram,
    showEmail: preview.showEmail,
    showCity: preview.showCity,
    allowReviews: preview.allowReviews,
  })
  const [declining, setDeclining] = useState(false)
  const set = (key: keyof typeof choices) => (checked: boolean) => setChoices((current) => ({ ...current, [key]: checked }))

  const name = firstName(preview.name)
  const spoken = preview.languageIds.flatMap((languageId) => languages.find((language) => language.id === languageId)?.name ?? [])
  const tags = [...preview.skills, ...(preview.city ? [preview.city] : []), ...spoken]
  const failure = confirm.error ?? decline.error

  const submit = () =>
    confirm.mutate(
      { show_whatsapp: choices.showWhatsapp, show_telegram: choices.showTelegram, show_instagram: choices.showInstagram, show_email: choices.showEmail, show_city: choices.showCity, allow_reviews: choices.allowReviews },
      { onSuccess: onConfirmed },
    )
  const signIn = () => {
    const state: ReturnState = { from: { pathname: claimPath(token) } }
    navigate(ROUTES.signIn, { state })
  }

  return (
    <div className="flex flex-col">
      {preview.recommendedBy && (
        <div className="mb-4 flex items-center gap-2.5 text-sm font-medium text-ink-2">
          <Avatar name={preview.recommendedBy.name || preview.recommendedBy.username} color={preview.recommendedBy.avatarColor} size="sm" />
          <span>
            <Trans i18nKey="claim.recommendedYou" values={{ name: preview.recommendedBy.name || preview.recommendedBy.username }} components={{ b: <b /> }} />
          </span>
        </div>
      )}
      <h1 className="m-0 mb-2.5 font-display text-display-lg text-ink-1">{t('claim.title', { name })}</h1>
      <p className="m-0 mb-5.5 text-sm font-medium text-ink-3">{t('claim.lede')}</p>

      <Card padding="lg" className="mb-4.5 flex flex-col gap-3.5">
        <div>
          <div className="text-label font-semibold text-ink-3">{t('claim.fields.name')}</div>
          <div className="mt-1 text-md font-semibold text-ink-1">{preview.name}</div>
        </div>
        {preview.bio && (
          <div>
            <div className="text-label font-semibold text-ink-3">{t('claim.fields.help')}</div>
            <p className="m-0 mt-1 text-sm font-medium text-pretty text-ink-2">{preview.bio}</p>
          </div>
        )}
        {tags.length > 0 && (
          <ul aria-label={t('claim.fields.tags')} className="m-0 flex list-none flex-wrap gap-1.5 p-0">
            {tags.map((tag) => (
              <li key={tag}>
                <Tag size="md">{tag}</Tag>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Section title={t('claim.privacy.title')} size="sm" as="h2">
        <Card padding="none" className="mb-5.5 divide-y divide-border-1">
          {CONTACTS.map(({ key, toggle }) => (
            <ToggleRow
              key={key}
              title={t(`claim.privacy.${key}`)}
              description={preview[key] ?? t('claim.privacy.notProvided')}
              checked={!!preview[key] && choices[toggle]}
              disabled={!preview[key]}
              onChange={set(toggle)}
            />
          ))}
          <ToggleRow title={t('claim.privacy.city')} description={preview.city ?? t('claim.privacy.notProvided')} checked={!!preview.city && choices.showCity} disabled={!preview.city} onChange={set('showCity')} />
          <ToggleRow title={t('claim.privacy.reviews')} description={t('claim.privacy.reviewsHint')} checked={choices.allowReviews} onChange={set('allowReviews')} />
        </Card>
      </Section>

      {failure && <Callout tone="danger" title={t(apiErrorStatus(failure) === HTTP_FORBIDDEN ? 'claim.errors.own' : 'claim.errors.generic')} className="mb-3.5" />}
      <Button variant="accent" size="lg" className="w-full" loading={confirm.isPending} onClick={submit}>
        {t('claim.confirm')}
      </Button>
      {username ? (
        <p className="m-0 mt-3 text-center text-label font-medium text-ink-3">{t('claim.signedInAs', { username })}</p>
      ) : (
        <Button variant="ghost" icon="user" className="mt-2.5 w-full bg-surface" onClick={signIn}>
          {t('claim.signIn')}
        </Button>
      )}
      <div className="mt-4.5 text-center">
        {declining ? (
          <div className="flex flex-col items-center gap-2.5">
            <p className="m-0 text-label font-medium text-ink-2">{t('claim.decline.ask')}</p>
            <div className="flex gap-2.5">
              <Button variant="danger" size="sm" loading={decline.isPending} onClick={() => decline.mutate(undefined, { onSuccess: onDeclined })}>
                {t('claim.decline.yes')}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setDeclining(false)}>
                {t('claim.decline.no')}
              </Button>
            </div>
          </div>
        ) : (
          <TextLink tone="danger" onClick={() => setDeclining(true)}>
            {t('claim.decline.link')}
          </TextLink>
        )}
      </div>
    </div>
  )
}
