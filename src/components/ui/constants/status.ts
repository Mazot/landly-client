import type { OrganisationStatus, PersonStatus } from '@/types/api'
import type { Tone } from './tones'

/** Moderation / claim statuses of places and people. */
export type EntityStatus = OrganisationStatus | PersonStatus

/** Badge tone per status; labels are `ui:status.<status>`. */
export const STATUS_TONES: Record<EntityStatus, Tone> = {
  pending: 'warning',
  live: 'success',
  rejected: 'danger',
  awaiting: 'info',
  confirmed: 'success',
  claimed: 'success',
  declined: 'neutral',
}
