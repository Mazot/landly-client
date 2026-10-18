// Organisation photos — server feature `images` (files live in S3/R2).
import type { ServerDateTime, Uuid } from './shared'

/**
 * MIME types the server accepts. It lowercases but does not normalise them, so
 * the non-standard `image/jpg` can come back in `contentType` as-is.
 */
export const IMAGE_CONTENT_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'] as const
export type ImageContentType = (typeof IMAGE_CONTENT_TYPES)[number]

/** Upload body cap enforced by the server while streaming. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024

/** `ImageContent`. */
export interface OrganisationImage {
  id: Uuid
  organisationId: Uuid
  /** Original file name from the upload. */
  fileName: string
  /** jpeg/png/webp/gif, lowercased. */
  contentType: ImageContentType
  /** Size in bytes (max 10 MB). */
  fileSize: number
  /** Not computed yet — always null. */
  width: number | null
  /** Not computed yet — always null. */
  height: number | null
  /** Main photo. `set-primary` clears the flag on the others; an upload with the flag does not. */
  isPrimary: boolean
  /** Public URL of the file. */
  url: string
  createdAt: ServerDateTime
  updatedAt: ServerDateTime
}

/**
 * `POST /api/images/upload/{organisation_id}` — multipart fields `file` and
 * `is_primary` ("true"/"false"). Org creator or moderator/admin only.
 */
export interface UploadImageInput {
  file: File
  isPrimary?: boolean
}
