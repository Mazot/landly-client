import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Sheet, StatusBadge, StepList } from '@/components/ui'
import { instagramUrl, telegramUrl, whatsappUrl } from '@/lib/contacts'
import { firstName } from '@/lib/text'
import type { PersonCreated } from '@/types/api'

/** How long "Copied" stays on the copy button. */
export const COPIED_FEEDBACK_MS = 2000

export interface ClaimLinkSheetProps {
  /** The answer of `POST /person/create`; the sheet is open while there is one. */
  created: PersonCreated | undefined
  /** The contacts typed in the form: where the message to the person goes. */
  contacts: { whatsapp: string; email: string; telegram: string; instagram: string }
  onClose: () => void
}

/**
 * "Send {name} their link": the personal claim link (Landly sends nothing itself), copy, and the chat or
 * mail that opens with the message ready; plus what happens after.
 */
export function ClaimLinkSheet({ created, contacts, onClose }: ClaimLinkSheetProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS)
    return () => clearTimeout(timer)
  }, [copied])

  const link = created ? new URL(created.claimUrl, window.location.origin).href : ''
  const name = firstName(created?.person.name ?? '')
  const message = t('recommend.claim.message', { name, link })
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
    } catch {
      // No clipboard (plain http) or permission refused: the link is on screen to select.
    }
  }
  // Telegram and Instagram open the person's chat or profile — there is no way to put the text in, so the link is pasted.
  const ways = {
    whatsapp: { href: `${whatsappUrl(contacts.whatsapp)}?text=${encodeURIComponent(message)}`, icon: 'phone', label: t('recommend.claim.openWhatsapp'), variant: 'whatsapp' },
    email: { href: `mailto:${contacts.email.trim()}?subject=${encodeURIComponent(t('recommend.claim.subject'))}&body=${encodeURIComponent(message)}`, icon: 'mail', label: t('recommend.claim.openEmail'), variant: 'accent' },
    telegram: { href: telegramUrl(contacts.telegram.trim()), icon: 'link', label: t('recommend.claim.openTelegram'), variant: 'accent', paste: true },
    instagram: { href: instagramUrl(contacts.instagram.trim()), icon: 'image', label: t('recommend.claim.openInstagram'), variant: 'accent', paste: true },
  } as const
  const way = ways[created?.sendVia ?? 'whatsapp']

  return (
    <Sheet
      open={!!created}
      onClose={onClose}
      title={t('recommend.claim.title', { name })}
      subtitle={t('recommend.claim.subtitle')}
      footer={
        <>
          <Button variant="secondary" icon={copied ? 'check' : 'link'} onClick={() => void copy()}>
            {t(copied ? 'recommend.claim.copied' : 'recommend.claim.copy')}
          </Button>
          <Button href={way.href} icon={way.icon} variant={way.variant} className="flex-1">
            {way.label}
          </Button>
        </>
      }
    >
      <div className="mb-4.5 rounded-r3 border border-border-1 bg-surface-2 px-3.5 py-3 font-mono text-sm break-all text-ink-1">{link}</div>
      {'paste' in way && <p className="m-0 -mt-2.5 mb-4.5 text-label font-medium text-ink-3">{t('recommend.claim.pasteHint')}</p>}
      <div className="mb-1 text-label font-semibold tracking-wider text-ink-3 uppercase">{t('recommend.claim.next')}</div>
      <StepList
        items={[
          { icon: 'flag', title: t('recommend.claim.steps.review'), state: 'todo', trailing: <StatusBadge status="pending" /> },
          { icon: 'mail', title: t('recommend.claim.steps.confirm', { name }), state: 'todo', trailing: <StatusBadge status="awaiting" /> },
          { icon: 'check', title: t('recommend.claim.steps.live'), state: 'todo', trailing: <StatusBadge status="confirmed" /> },
        ]}
      />
    </Sheet>
  )
}
