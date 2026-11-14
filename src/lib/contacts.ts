// Links for the contact fields of an organisation (free text from the submitter).

/** Telegram and WhatsApp open a chat from these bases. */
export const TELEGRAM_URL = 'https://t.me/'
export const WHATSAPP_URL = 'https://wa.me/'

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i

/** A website as typed ("example.org") → a link that opens it. */
export const websiteUrl = (website: string) => (HAS_SCHEME.test(website) ? website : `https://${website}`)

/** "+49 30 1234-567" → "tel:+49301234567". */
export const phoneUrl = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

/** A Telegram handle ("@landly", "landly") or link → a link that opens the chat. */
export const telegramUrl = (telegram: string) => (HAS_SCHEME.test(telegram) ? telegram : `${TELEGRAM_URL}${telegram.replace(/^@/, '')}`)

/** A WhatsApp number or link → a link that opens the chat (digits only, as wa.me wants). */
export const whatsappUrl = (whatsapp: string) => (HAS_SCHEME.test(whatsapp) ? whatsapp : `${WHATSAPP_URL}${whatsapp.replace(/\D/g, '')}`)

/** A website without its scheme and trailing slash, as people read it. */
export const websiteLabel = (website: string) => website.replace(HAS_SCHEME, '').replace(/\/$/, '')
