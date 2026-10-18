// Recommended helpers ("people") and the claim flow — server feature `person`.
import type { PaginationParams, ServerDateTime, Uuid } from './shared'

/**
 * `pending` (moderation) → `awaiting` (approved, waiting for the person) →
 * `confirmed` / `claimed` (linked to an account), or `declined`.
 * Only confirmed/claimed people are public.
 */
export const PERSON_STATUSES = ['pending', 'awaiting', 'confirmed', 'claimed', 'declined'] as const
export type PersonStatus = (typeof PERSON_STATUSES)[number]

/** How the recommender sends the claim link. */
export const SEND_VIA = ['email', 'whatsapp'] as const
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
}

/** `POST /api/person/create` (auth). Email or WhatsApp is required. */
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
  send_via?: SendVia
  /** Default true. */
  show_city?: boolean
  /** Default false. */
  show_email?: boolean
  /** Default false. */
  show_whatsapp?: boolean
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
  showCity: boolean
  showEmail: boolean
  showWhatsapp: boolean
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
  allow_reviews?: boolean
}
