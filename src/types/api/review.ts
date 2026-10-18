// Reviews of an organisation or a person — server feature `review`.
import type { PaginationParams, ServerDateTime, Uuid } from './shared'

export const MIN_RATING = 1
export const MAX_RATING = 5

/** `ReviewContent` — exactly one of `organisationId` / `personId` is set. */
export interface Review {
  id: Uuid
  authorId: Uuid
  organisationId: Uuid | null
  personId: Uuid | null
  /** 1–5. */
  rating: number
  text: string | null
  /** Topic tag, e.g. "Anmeldung help". */
  topic: string | null
  createdAt: ServerDateTime
}

/** Exactly one review target. */
export type ReviewTarget =
  | { organisation_id: Uuid; person_id?: never }
  | { person_id: Uuid; organisation_id?: never }

/**
 * `POST /api/review/create` (auth) — one review per author and target; a person
 * must be public and allow reviews.
 */
export type CreateReviewRequest = ReviewTarget & {
  /** 1–5. */
  rating: number
  text?: string
  topic?: string
}

/** `GET /api/review/list` — newest first (limit default 20, max 100; offset max 500). */
export type ReviewsListQuery = ReviewTarget & PaginationParams
