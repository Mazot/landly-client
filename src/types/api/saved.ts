// The caller's bookmarks — server feature `saved` (all routes need auth).
import type { ServerDateTime, Uuid } from './shared'

export const SAVED_KINDS = ['org', 'person', 'country', 'corridor'] as const
export type SavedKind = (typeof SAVED_KINDS)[number]

/** `SavedItemContent` — polymorphic (`kind` + `targetId`, no FK). */
export interface SavedItem {
  id: Uuid
  kind: SavedKind
  targetId: Uuid
  /** User-defined list, e.g. "Moving checklist". */
  listName: string | null
  /** Private note, visible only to the owner. */
  note: string | null
  createdAt: ServerDateTime
}

/** `POST /api/saved/create` — each target can be saved once per user (422 otherwise). */
export interface CreateSavedRequest {
  kind: SavedKind
  target_id: Uuid
  list_name?: string
  note?: string
}

/** `GET /api/saved/list` — newest first; all kinds when `kind` is omitted. */
export interface SavedListQuery {
  kind?: SavedKind
}

/** `GET /api/saved/counts`. */
export interface SavedCounts {
  total: number
  org: number
  person: number
  country: number
  corridor: number
}
