import { z } from 'zod'
import { charCount } from '@/lib/text'
import { CITY_MAX_CHARS, EMAIL_MAX_CHARS, HANDLE_MAX_CHARS, LANGUAGE_IDS_MAX, PERSON_BIO_MAX_CHARS, PERSON_NAME_MAX_CHARS, SEND_VIA, SKILLS_MAX } from '@/types/api'

/**
 * Client-side mirror of the server's checks on `POST /person/create` (`person/usecases.rs`,
 * `utils/validation.rs` limits). Messages are `recommend.errors.*` i18n keys.
 */

const capped = (max: number, key: string) => z.string().refine((value) => charCount(value.trim()) <= max, key)

export const recommendSchema = z
  .object({
    name: z.string().trim().min(1, 'recommend.errors.nameRequired').refine((value) => charCount(value) <= PERSON_NAME_MAX_CHARS, 'recommend.errors.tooLong'),
    city: capped(CITY_MAX_CHARS, 'recommend.errors.tooLong'),
    bio: capped(PERSON_BIO_MAX_CHARS, 'recommend.errors.tooLong'),
    skills: z.array(z.string()).max(SKILLS_MAX, 'recommend.errors.tooMany'),
    languageIds: z.array(z.string()).max(LANGUAGE_IDS_MAX, 'recommend.errors.tooMany'),
    whatsapp: capped(HANDLE_MAX_CHARS, 'recommend.errors.tooLong'),
    email: z
      .string()
      .trim()
      .refine((value) => charCount(value) <= EMAIL_MAX_CHARS, 'recommend.errors.tooLong')
      .refine((value) => value === '' || z.email().safeParse(value).success, 'recommend.errors.email'),
    telegram: capped(HANDLE_MAX_CHARS, 'recommend.errors.tooLong'),
    instagram: capped(HANDLE_MAX_CHARS, 'recommend.errors.tooLong'),
    sendVia: z.enum(SEND_VIA),
    consent: z.boolean().refine((value) => value, 'recommend.errors.consentRequired'),
  })
  // The claim link is sent through one of the contacts, so there must be one — and it must be the chosen one.
  .superRefine((values, context) => {
    const contacts = { whatsapp: values.whatsapp.trim(), email: values.email.trim(), telegram: values.telegram.trim(), instagram: values.instagram.trim() }
    if (!Object.values(contacts).some(Boolean)) context.addIssue({ code: 'custom', path: ['whatsapp'], message: 'recommend.errors.contactRequired' })
    // Said on the choice itself: under an empty field it would read as "this one is required".
    else if (!contacts[values.sendVia]) context.addIssue({ code: 'custom', path: ['sendVia'], message: 'recommend.errors.sendViaContact' })
  })
