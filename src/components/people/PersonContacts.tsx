import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Callout, Divider, Icon } from '@/components/ui'
import { useSavedPeople } from '@/hooks/useSavedPlaces'
import { useVouchPerson } from '@/hooks/usePeople'
import { instagramUrl, telegramUrl, whatsappUrl } from '@/lib/contacts'
import { apiErrorStatus } from '@/lib/errors'
import { firstName } from '@/lib/text'
import { ROUTES, type ReturnState } from '@/lib/routes'
import { useAuthStore } from '@/stores/authStore'
import type { Person } from '@/types/api'

/** The server's answers to a vouch it refuses. */
const HTTP_FORBIDDEN = 403

export interface PersonContactsProps {
  person: Person
}

/** The helper's contacts — only the ones they chose to show — and what to do with the profile: vouch, save. */
export function PersonContacts({ person }: PersonContactsProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const saved = useSavedPeople()
  const vouch = useVouchPerson()
  const isSaved = isAuthenticated && saved.isSaved(person.id)
  const vouched = person.vouchedByMe === true
  const who = firstName(person.name)

  // A guest is sent to sign in and comes back to this profile.
  const signInFirst = (then: () => void) => () => {
    if (isAuthenticated) return then()
    const state: ReturnState = { from: { pathname: location.pathname, search: location.search } }
    navigate(ROUTES.signIn, { state })
  }

  // The server leaves out the contacts the person keeps private; say which ones.
  const channels = { whatsapp: person.whatsapp, telegram: person.telegram, instagram: person.instagram, email: person.email }
  const hidden = Object.entries(channels).flatMap(([channel, value]) => (value ? [] : [t(`person.channel.${channel}`)]))

  return (
    <div className="flex flex-col gap-3">
      {person.whatsapp && (
        <Button href={whatsappUrl(person.whatsapp)} icon="phone" size="lg" variant="whatsapp" className="w-full">
          {t('person.whatsapp', { number: person.whatsapp })}
        </Button>
      )}
      {person.telegram && (
        <Button href={telegramUrl(person.telegram)} icon="link" variant="secondary" className="w-full">
          {t('person.telegram', { handle: person.telegram })}
        </Button>
      )}
      {person.instagram && (
        <Button href={instagramUrl(person.instagram)} icon="image" variant="secondary" className="w-full">
          {t('person.instagram', { handle: person.instagram })}
        </Button>
      )}
      {person.email && (
        <Button href={`mailto:${person.email}`} icon="mail" variant="secondary" className="w-full">
          {person.email}
        </Button>
      )}
      <div className="flex items-start gap-2 rounded-r3 border border-border-1 bg-surface-2 px-3 py-2.75 text-label font-medium text-ink-3">
        <Icon name="eyeOff" size={14} className="mt-px shrink-0" />
        {hidden.length === Object.keys(channels).length
          ? t('person.contactsPrivate', { name: who })
          : hidden.length > 0
            ? t('person.contactPrivate', { name: who, channels: hidden.join(', ') })
            : t('person.contactsShared', { name: who })}
      </div>
      <Divider />
      <Button variant="ghost" icon="heart" className="w-full" disabled={vouched} loading={vouch.isPending} aria-pressed={vouched} onClick={signInFirst(() => vouch.mutate({ id: person.id }))}>
        {vouched ? t('person.vouched', { count: person.vouches }) : t('person.vouch', { name: who, count: person.vouches })}
      </Button>
      {vouch.isError ? (
        <Callout tone="danger">{t(apiErrorStatus(vouch.error) === HTTP_FORBIDDEN ? 'person.vouchOwn' : 'person.vouchFailed')}</Callout>
      ) : (
        <p className="m-0 text-center text-label font-medium text-ink-3">{t('person.vouchHint', { name: who })}</p>
      )}
      <Button variant="secondary" size="sm" icon="bookmark" aria-pressed={isSaved} className="w-full" onClick={signInFirst(() => saved.toggle(person.id))}>
        {t(isSaved ? 'person.saved' : 'person.save')}
      </Button>
    </div>
  )
}
