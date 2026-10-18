// User reports for moderators — server feature `report`.
import type { ServerDateTime, Uuid } from './shared'

export const REPORT_TARGET_KINDS = ['org', 'person', 'conversation'] as const
export type ReportTargetKind = (typeof REPORT_TARGET_KINDS)[number]

export const REPORT_STATUSES = ['open', 'resolved', 'dismissed'] as const
export type ReportStatus = (typeof REPORT_STATUSES)[number]

/** `ReportContent`. */
export interface Report {
  id: Uuid
  targetKind: ReportTargetKind
  /** Polymorphic, no FK. */
  targetId: Uuid
  reason: string
  status: ReportStatus
  createdAt: ServerDateTime
}

/** `POST /api/report/create` (auth). */
export interface CreateReportRequest {
  target_kind: ReportTargetKind
  target_id: Uuid
  reason: string
}
