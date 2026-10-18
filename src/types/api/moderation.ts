// Moderation queue and decisions — server feature `moderation` (moderator/admin only).
import type { ServerDateTime, Uuid } from './shared'

export const MODERATION_KINDS = ['org', 'person'] as const
export type ModerationKind = (typeof MODERATION_KINDS)[number]

export const MODERATION_ACTIONS = ['submitted', 'approve', 'request_changes', 'reject'] as const
export type ModerationAction = (typeof MODERATION_ACTIONS)[number]

/**
 * Submit-time auto-checks written by the server into the `submitted` event.
 * Which keys are set depends on the event: org submission, person submission,
 * or `editedAfterApproval` when a creator edited a live place.
 */
export interface ModerationFlags {
  // organisation submission
  duplicateNearby?: boolean
  /** Null when no phone was given. */
  phoneLooksValid?: boolean | null
  creatorLiveOrgs?: number
  trustedVolunteer?: boolean
  /** Null without a place id, false when the server had no Places key. */
  googlePlaceVerified?: boolean | null
  /** Google's `businessStatus`, e.g. "OPERATIONAL". */
  googleBusinessStatus?: string | null
  // person submission
  recommenderApprovedPeople?: number
  trustedRecommender?: boolean
  // creator edit of a live organisation
  editedAfterApproval?: boolean
  [key: string]: unknown
}

/** `ModerationEventContent`. */
export interface ModerationEvent {
  action: ModerationAction
  /** Null for the automatic `submitted` event. */
  moderatorId: Uuid | null
  note: string | null
  flags: ModerationFlags | null
  createdAt: ServerDateTime
}

/** `ModerationQueueItemContent` — a pending organisation or person. */
export interface ModerationQueueItem {
  kind: ModerationKind
  targetId: Uuid
  name: string
  city: string | null
  /** Always `pending` while in the queue. */
  status: string
  /** Creator of the organisation / recommender of the person. */
  submittedBy: Uuid | null
  lastEvent: ModerationEvent | null
  /** Open user reports against this item. */
  openReports: number
  createdAt: ServerDateTime
}

/** `GET /api/moderation/queue` — both kinds when omitted. */
export interface ModerationQueueQuery {
  kind?: ModerationKind
}

/**
 * Body of `POST /api/moderation/{approve,request-changes,reject}`.
 * Approve flips org → `live` / person → `awaiting`; request-changes requires a
 * `note` and keeps the item pending.
 */
export interface ModerationDecisionRequest {
  kind: ModerationKind
  target_id: Uuid
  note?: string
}
