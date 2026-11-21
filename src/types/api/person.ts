// Recommended helpers ("people") and the claim flow — server feature `person`.
import type { PaginationParams, ServerDateTime, Uuid } from './shared'
import type { PublicUser } from './user'

/**
 * `pending` (moderation) → `awaiting` (approved, waiting for the person) →
 * `confirmed` / `claimed` (linked to an account), or `declined`.
 * Only confirmed/claimed people are public.
 */
export const PERSON_STATUSES = ['pending', 'awaiting', 'confirmed', 'claimed', 'declined'] as const
export type PersonStatus = (typeof PERSON_STATUSES)[number]

/** How the recommender sends the claim link. */
export const SEND_VIA = ['email', 'whatsapp', 'telegram', 'instagram'] as const
export type SendVia = (typeof SEND_VIA)[number]

/** `PersonContent` — hidden contacts are present only once public and allowed by the person. */
export interface Person {
  id: Uuid
  /** Display name, e.g. "Daria K.". */
  name: string
  status: PersonStatus
  bio: string | null
  /** Null unless the person publishes the city. */
  city: string | null
  locationCountryId: Uuid | null
  /** e.g. ["Relocation", "Housing"]. */
  skills: string[]
  languageIds: Uuid[]
  allowReviews: boolean
  ratingAvg: number | null
  reviewsCount: number
  /** Users who vouched for this person. */
  vouches: number
  createdAt: ServerDateTime
  /** Present only when confirmed/claimed and `show_email` is on. */
  email?: string
  /** Present only when confirmed/claimed and `show_whatsapp` is on. */
  whatsapp?: string
  /** Present only when confirmed/claimed and `show_telegram` is on: a handle ("@daria") or a link, as entered. */
  telegram?: string
  /** Present only when confirmed/claimed and `show_instagram` is on: a handle ("daria.k") or a link, as entered. */
  instagram?: string
  /** Detail payload only: who recommended the person (public face); absent when unknown or the account is gone. */
  recommendedBy?: PublicUser
  /** Detail payload only: true once the signed-in viewer vouched; false for guests. */
  vouchedByMe?: boolean
}

/** `GET /api/person/skills` item: one choice of what a helper can help with. */
export interface PersonSkill {
  id: Uuid
  /** What `Person.skills` holds and the list filter takes. */
  name: string
}

/**
 * `GET /api/person/mine` item (auth): a person the caller recommended, in any status.
 * The public payload (contacts gated as everywhere) plus what only the recommender is told.
 */
export interface MyPerson extends Person {
  /** Moderator's note from request-changes / reject; null otherwise. */
  moderationNote: string | null
  /** Last change: moderation, or the person answering the claim link. */
  updatedAt: ServerDateTime
  /** `declined` because a moderator rejected it — not because the person turned the claim down. */
  rejectedByModerator: boolean
}

/** `GET /api/person/mine` — newest first (limit default 20, max 100). */
export type MyPeopleQuery = PaginationParams

/** `POST /api/person/create` (auth). At least one of email, WhatsApp, Telegram, Instagram is required. */
export interface CreatePersonRequest {
  name: string
  /** Must be true: the person agreed to be recommended. */
  consent_given: boolean
  bio?: string
  city?: string
  location_country_id?: Uuid
  skills?: string[]
  language_ids?: Uuid[]
  /** Hidden contact — used for the claim link, gated afterwards. */
  email?: string
  /** Hidden contact — used for the claim link, gated afterwards. */
  whatsapp?: string
  /** Hidden contact — used for the claim link, gated afterwards. */
  telegram?: string
  /** Hidden contact — used for the claim link, gated afterwards. */
  instagram?: string
  send_via?: SendVia
  /** Default true. */
  show_city?: boolean
  /** Default false. */
  show_email?: boolean
  /** Default false. */
  show_whatsapp?: boolean
  /** Default false. */
  show_telegram?: boolean
  /** Default false. */
  show_instagram?: boolean
  /** Default true. */
  allow_reviews?: boolean
}

/** Answer of `POST /api/person/create`. */
export interface PersonCreated {
  /** The created recommendation (status `pending`). */
  person: Person
  /** Relative client link `/claim/{token}` for the recommender to send; valid 30 days. */
  claimUrl: string
  sendVia: SendVia | null
}

/** `GET /api/person/list` — public people only (limit default 20, max 100; offset max 500). */
export interface PeopleListQuery extends PaginationParams {
  /** Skill names, sent comma-separated. */
  skills?: string[]
  /** Case-insensitive substring filter. */
  city?: string
  /** Language ids, sent comma-separated. */
  language_ids?: Uuid[]
  /** Only people living in this country (the corridor's destination). */
  location_country_id?: Uuid
}

/** `POST /api/person/vouch/{id}` (auth). */
export interface VouchPersonRequest {
  /** Stored with the vouch, not returned yet. */
  note?: string
}

/**
 * `GET /api/person/claim/{token}` and the answer of `/confirm` — shown only to
 * the holder of the token, so the hidden contacts are included.
 * The claim routes are public: the token is the credential.
 */
export interface ClaimPreview {
  name: string
  status: PersonStatus
  bio: string | null
  city: string | null
  skills: string[]
  email: string | null
  whatsapp: string | null
  telegram: string | null
  instagram: string | null
  showCity: boolean
  showEmail: boolean
  showWhatsapp: boolean
  showTelegram: boolean
  showInstagram: boolean
  allowReviews: boolean
}

/**
 * `POST /api/person/claim/{token}/confirm` — only from `awaiting`, never by the
 * recommender's own account; omitted toggles keep their value.
 */
export interface ClaimConfirmRequest {
  show_city?: boolean
  show_email?: boolean
  show_whatsapp?: boolean
  show_telegram?: boolean
  show_instagram?: boolean
  allow_reviews?: boolean
}
