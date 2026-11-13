import { z } from 'zod'
import { isValidInterval } from '@/lib/placeDraft'
import {
  ADDRESS_MAX_CHARS,
  DESCRIPTION_MAX_CHARS,
  EMAIL_MAX_CHARS,
  ORG_NAME_MAX_CHARS,
  PHONE_MAX_CHARS,
  TAG_MAX_CHARS,
  TAGS_PER_LIST_MAX,
  URL_MAX_CHARS,
  WEEKDAYS,
} from '@/types/api'

/**
 * Client-side mirror of the server's checks on `POST /organisation/create` (`utils/validation.rs`
 * limits, opening-hours shape). Messages are `addPlace.errors.*` i18n keys.
 */

/** Length in Unicode code points, like the server's `chars().count()`. */
const chars = (value: string) => [...value].length
const capped = (max: number, key: string) => z.string().refine((value) => chars(value.trim()) <= max, key)
const optionalText = (max: number) => capped(max, 'addPlace.errors.tooLong')
const tags = z.array(z.string().refine((value) => chars(value) <= TAG_MAX_CHARS, 'addPlace.errors.tagTooLong')).max(TAGS_PER_LIST_MAX, 'addPlace.errors.tooManyTags')
const day = z.tuple([z.string(), z.string()]).refine(isValidInterval, 'addPlace.errors.hours').nullable()

export const placeSchema = z.object({
  name: z.string().trim().min(1, 'addPlace.errors.nameRequired').refine((value) => chars(value) <= ORG_NAME_MAX_CHARS, 'addPlace.errors.tooLong'),
  typeId: z.string().min(1, 'addPlace.errors.typeRequired'),
  address: optionalText(ADDRESS_MAX_CHARS),
  tel: optionalText(PHONE_MAX_CHARS),
  email: z
    .string()
    .trim()
    .refine((value) => chars(value) <= EMAIL_MAX_CHARS, 'addPlace.errors.tooLong')
    .refine((value) => value === '' || z.email().safeParse(value).success, 'addPlace.errors.email'),
  website: optionalText(URL_MAX_CHARS),
  description: optionalText(DESCRIPTION_MAX_CHARS),
  services: tags,
  languages: tags,
  hours: z.object(Object.fromEntries(WEEKDAYS.map((weekday) => [weekday, day])) as Record<(typeof WEEKDAYS)[number], typeof day>),
  fromId: z.string().min(1, 'addPlace.errors.countryRequired'),
  toId: z.string().min(1, 'addPlace.errors.countryRequired'),
})
