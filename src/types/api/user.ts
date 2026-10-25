// Accounts, profile and auth — server feature `user`.
import type { Uuid } from './shared'

/** RBAC role (`user` < `moderator` < `admin`); changed only in the database. */
export const USER_ROLES = ['user', 'moderator', 'admin'] as const
export type UserRole = (typeof USER_ROLES)[number]

/** Why the user is on Landly. */
export const HERE_AS = ['newcomer', 'helping', 'exploring'] as const
export type HereAs = (typeof HERE_AS)[number]

/** UI language; also the client's i18n languages. */
export const LOCALES = ['en', 'ru', 'uk'] as const
export type Locale = (typeof LOCALES)[number]

/** Credential limits checked by the server (passwords: 8 chars to 72 bytes — bcrypt). */
export const USERNAME_MIN_CHARS = 3
export const USERNAME_MAX_CHARS = 50
export const PASSWORD_MIN_CHARS = 8
export const PASSWORD_MAX_BYTES = 72
export const EMAIL_MAX_CHARS = 254
export const NAME_MAX_CHARS = 100
export const CITY_MAX_CHARS = 100
export const BIO_MAX_CHARS = 1000
export const AVATAR_COLOR_MAX_CHARS = 32

/**
 * Unique constraints a signup can violate (422 `constraint`): the original
 * `users.username` / `users.email` UNIQUEs and the case-insensitive
 * `lower(email)` index that replaced the email one.
 */
export const SIGNUP_CONFLICT_CONSTRAINTS = {
  username: ['users_username_key'],
  email: ['users_email_key', 'users_email_lower_key'],
} as const

/** `AuthUserContent` — answer of signin, signup and the Google code exchange. */
export interface AuthUser {
  id: Uuid
  username: string
  /** Normalized (trimmed, lowercased). */
  email: string
  /** JWT for `Authorization: Bearer`; expires after the server's `JWT_EXPIRATION`. */
  token: string
}

/** `POST /api/user/signin` — unknown email and wrong password are the same 401. */
export interface SignInRequest {
  email: string
  password: string
}

/** `POST /api/user/signup`. Give both corridor ids or neither. */
export interface SignUpRequest {
  username: string
  email: string
  password: string
  name?: string
  here_as?: HereAs
  home_country_id?: Uuid
  /** Defaults to `en`. */
  locale?: Locale
  avatar_color?: string
  /** Optional default corridor, created with the user in one transaction. */
  corridor_from_country_id?: Uuid
  corridor_to_country_id?: Uuid
}

/** `POST /api/user/oauth/google/exchange` — `code` from `/auth/google/callback?code=…` (single use, 60 s). */
export interface OAuthExchangeRequest {
  code: string
}

/** Free-form notification preferences, stored as-is. */
export type NotificationSettings = Record<string, unknown>

/** Activity counters for the account screen. */
export interface UserProfileStats {
  /** Organisations this user submitted (any status). */
  placesAdded: number
  /** Not computed yet — always 0. */
  peopleHelped: number
  /** Not computed yet — always 0. */
  peopleRecommended: number
  /** Not computed yet — always null. */
  rating: number | null
}

/** `GET/PUT /api/user/me` — the caller's own profile. */
export interface UserProfile {
  id: Uuid
  username: string
  email: string
  role: UserRole
  name: string | null
  bio: string | null
  city: string | null
  hereAs: HereAs | null
  homeCountryId: Uuid | null
  locale: Locale
  avatarColor: string | null
  notificationSettings: NotificationSettings | null
  stats: UserProfileStats
}

/** `PUT /api/user/me` — omitted fields keep their value. */
export interface UpdateProfileRequest {
  name?: string
  bio?: string
  city?: string
  here_as?: HereAs
  home_country_id?: Uuid
  locale?: Locale
  avatar_color?: string
}

/** `PUT /api/user/me/notifications` — replaces the whole settings object. */
export interface UpdateNotificationSettingsRequest {
  notification_settings: NotificationSettings
}

/** `GET /api/user/{user_id}/languages` (public), `POST /api/user/languages` (caller). */
export interface UserLanguages {
  userId: Uuid
  languageIds: Uuid[]
}

/** `POST /api/user/languages` — adds to the caller's languages. */
export interface AddLanguagesRequest {
  languages_ids: Uuid[]
}

/** `DELETE /api/user/languages` (JSON body). */
export interface DeleteLanguageRequest {
  language_id: Uuid
}
