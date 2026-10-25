import { z } from 'zod'
import { AVATAR_COLOR_MAX_CHARS, EMAIL_MAX_CHARS, HERE_AS, LOCALES, NAME_MAX_CHARS, PASSWORD_MAX_BYTES, PASSWORD_MIN_CHARS, USERNAME_MAX_CHARS, USERNAME_MIN_CHARS } from '@/types/api'

/**
 * Client-side mirror of the server's credential rules (`user/entities.rs`).
 * Messages are `auth.errors.*` i18n keys — the form translates them.
 */
const email = z.string().trim().min(1, 'auth.errors.emailRequired').max(EMAIL_MAX_CHARS, 'auth.errors.emailInvalid').pipe(z.email('auth.errors.emailInvalid'))

/** Signin accepts any non-empty password: accounts created before the length rules still exist. */
export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'auth.errors.passwordRequired'),
})

export const signUpAccountSchema = z.object({
  username: z
    .string()
    .trim()
    .min(USERNAME_MIN_CHARS, 'auth.errors.usernameLength')
    .max(USERNAME_MAX_CHARS, 'auth.errors.usernameLength')
    .regex(/^[^\s\p{Cc}]+$/u, 'auth.errors.usernameSpaces'),
  email,
  password: z
    .string()
    .refine((value) => [...value].length >= PASSWORD_MIN_CHARS, 'auth.errors.passwordShort')
    .refine((value) => new TextEncoder().encode(value).length <= PASSWORD_MAX_BYTES, 'auth.errors.passwordLong'),
})

export const signUpProfileSchema = z.object({
  name: z.string().trim().max(NAME_MAX_CHARS, 'auth.errors.nameLong'),
  hereAs: z.enum(HERE_AS),
  locale: z.enum(LOCALES),
  avatarColor: z.string().max(AVATAR_COLOR_MAX_CHARS),
})

/** First validation message of a TanStack Form field (standard-schema issues or plain strings). */
export function firstErrorKey(errors: readonly unknown[]): string | undefined {
  const first = errors[0]
  if (typeof first === 'string') return first
  if (first && typeof first === 'object' && 'message' in first && typeof first.message === 'string') return first.message
  return undefined
}
