import { z } from 'zod'
import { AVATAR_COLOR_MAX_CHARS, BIO_MAX_CHARS, CITY_MAX_CHARS, HERE_AS, LANGUAGE_IDS_MAX, LOCALES, NAME_MAX_CHARS } from '@/types/api'

/** Length in Unicode code points, like the server's `chars().count()`. */
const chars = (value: string) => [...value].length
const text = (max: number) => z.string().refine((value) => chars(value.trim()) <= max, 'account.edit.errors.tooLong')

/**
 * Client-side mirror of the server's profile rules (`UserUsecase::update_profile`). Messages are
 * i18n keys. `''` stands for "not chosen" where the profile has no value yet.
 */
export const editProfileSchema = z.object({
  name: text(NAME_MAX_CHARS),
  city: text(CITY_MAX_CHARS),
  bio: text(BIO_MAX_CHARS),
  homeCountryId: z.string(),
  locale: z.enum(LOCALES),
  hereAs: z.enum(['', ...HERE_AS]),
  avatarColor: z.string().refine((value) => chars(value) <= AVATAR_COLOR_MAX_CHARS),
  languageIds: z.array(z.string()).max(LANGUAGE_IDS_MAX),
})

export type EditProfileValues = z.infer<typeof editProfileSchema>
