// Links for the contact fields of an organisation (free text from the submitter).

/** Telegram and WhatsApp open a chat from these bases. */
export const TELEGRAM_URL = 'https://t.me/'
export const WHATSAPP_URL = 'https://wa.me/'
export const INSTAGRAM_URL = 'https://instagram.com/'

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i
/**
 * The only schemes a stored value may keep: these fields are free text from the submitter, and a
 * `javascript://…` value kept as an href would run on the visitor's click. Anything else gets
 * `https://` in front, which makes it a harmless (broken at worst) web address.
 */
const WEB_SCHEME = /^https?:\/\//i

/** A website as typed ("example.org") → a link that opens it (only ever http or https). */
export const websiteUrl = (website: string) => (WEB_SCHEME.test(website) ? website : `https://${website}`)

/** "+49 30 1234-567" → "tel:+49301234567". */
export const phoneUrl = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

/** The hosts a stored Telegram / Instagram link may point at; any other link is read as a handle. */
const TELEGRAM_HOSTS = ['t.me', 'telegram.me']
const INSTAGRAM_HOSTS = ['instagram.com', 'www.instagram.com']
const WHATSAPP_HOSTS = ['wa.me', 'api.whatsapp.com', 'chat.whatsapp.com', 'whatsapp.com', 'www.whatsapp.com']

/** Whether `value` is an http(s) link to one of `hosts` (a "Telegram" button must not open any other site). */
function isLinkTo(value: string, hosts: readonly string[]): boolean {
  if (!WEB_SCHEME.test(value)) return false
  try {
    return hosts.includes(new URL(value).hostname.toLowerCase())
  } catch {
    return false
  }
}

/** A handle as a path segment: no "@", no scheme or slashes, so it cannot lead off the service. */
const handle = (value: string) => encodeURIComponent(value.trim().replace(/^@/, '').replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/\/.*$/, ''))

/** A Telegram handle ("@landly", "landly") or t.me link → a link that opens the chat; never another site. */
export const telegramUrl = (telegram: string) => (isLinkTo(telegram, TELEGRAM_HOSTS) ? telegram : `${TELEGRAM_URL}${handle(telegram)}`)

/** An Instagram handle ("@daria.k", "daria.k") or instagram.com link → a link that opens the profile; never another site. */
export const instagramUrl = (instagram: string) => (isLinkTo(instagram, INSTAGRAM_HOSTS) ? instagram : `${INSTAGRAM_URL}${handle(instagram)}`)

/** A WhatsApp number or WhatsApp link → a link that opens the chat (digits only, as wa.me wants); never another site. */
export const whatsappUrl = (whatsapp: string) => (isLinkTo(whatsapp, WHATSAPP_HOSTS) ? whatsapp : `${WHATSAPP_URL}${whatsapp.replace(/\D/g, '')}`)

/** A website without its scheme and trailing slash, as people read it. */
export const websiteLabel = (website: string) => website.replace(HAS_SCHEME, '').replace(/\/$/, '')

/**
 * `url` with the message as its `text` parameter (WhatsApp prefills it), whatever query it already
 * has. Encoded with `encodeURIComponent` (spaces as `%20`): WhatsApp does not read `+` as a space.
 */
export function withText(url: string, text: string): string {
  const link = new URL(url)
  link.searchParams.delete('text')
  return `${link.href}${link.search ? '&' : '?'}text=${encodeURIComponent(text)}`
}
