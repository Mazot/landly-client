import { useTranslation } from 'react-i18next'
import { IconTile, TextLink, type IconName } from '@/components/ui'
import { phoneUrl, telegramUrl, websiteLabel, websiteUrl, whatsappUrl } from '@/lib/contacts'
import type { Organisation } from '@/types/api'

export interface PlaceContactsProps {
  place: Pick<Organisation, 'tel' | 'email' | 'website' | 'telegram' | 'whatsapp'>
}

/** Every contact the place has, each a link that calls, writes or opens it; nothing when it has none. */
export function PlaceContacts({ place }: PlaceContactsProps) {
  const { t } = useTranslation()
  const rows: { key: string; icon: IconName; label: string; text: string; href: string }[] = []
  if (place.tel) rows.push({ key: 'tel', icon: 'phone', label: t('place.contacts.phone'), text: place.tel, href: phoneUrl(place.tel) })
  if (place.email) rows.push({ key: 'email', icon: 'mail', label: t('place.contacts.email'), text: place.email, href: `mailto:${place.email}` })
  if (place.website) rows.push({ key: 'website', icon: 'globe', label: t('place.contacts.website'), text: websiteLabel(place.website), href: websiteUrl(place.website) })
  if (place.telegram) rows.push({ key: 'telegram', icon: 'link', label: t('place.contacts.telegram'), text: place.telegram, href: telegramUrl(place.telegram) })
  if (place.whatsapp) rows.push({ key: 'whatsapp', icon: 'phone', label: t('place.contacts.whatsapp'), text: place.whatsapp, href: whatsappUrl(place.whatsapp) })
  if (rows.length === 0) return null

  return (
    <ul aria-label={t('place.contacts.title')} className="m-0 flex list-none flex-col gap-2.5 p-0">
      {rows.map((row) => (
        <li key={row.key} className="flex min-w-0 items-center gap-2.75">
          <IconTile icon={row.icon} size="xs" />
          <span className="sr-only">{row.label}: </span>
          <TextLink href={row.href} tone="strong" size="md" className="min-w-0 truncate">
            {row.text}
          </TextLink>
        </li>
      ))}
    </ul>
  )
}
