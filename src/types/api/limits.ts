// Input caps enforced by landly-server (`utils/validation.rs`). Lengths count
// Unicode characters (not bytes); a longer value is a 422
// `"{field} must be at most N characters"`. User credentials/profile limits
// live in `user.ts`.

/** `MAX_JSON_BODY_BYTES` — larger JSON bodies are refused (image upload: `MAX_IMAGE_BYTES`). */
export const MAX_JSON_BODY_BYTES = 64 * 1024

// Organisations
export const ORG_NAME_MAX_CHARS = 200
export const PHONE_MAX_CHARS = 32
export const ADDRESS_MAX_CHARS = 300
export const URL_MAX_CHARS = 2048
/** Telegram / WhatsApp handle or link. */
export const HANDLE_MAX_CHARS = 100
export const DESCRIPTION_MAX_CHARS = 2000
export const TIMEZONE_MAX_CHARS = 64
/** One service / language / skill tag, and how many a list may hold. */
export const TAG_MAX_CHARS = 60
export const TAGS_PER_LIST_MAX = 30
/** Serialized size of `opening_hours` / `notification_settings`. */
export const JSON_DOCUMENT_MAX_BYTES = 4 * 1024

// People
export const PERSON_NAME_MAX_CHARS = 100
export const PERSON_BIO_MAX_CHARS = 1000
export const SKILLS_MAX = 20
export const LANGUAGE_IDS_MAX = 30
export const VOUCH_NOTE_MAX_CHARS = 500

// Reviews, reports, check-ins, bookmarks
export const REVIEW_TEXT_MAX_CHARS = 2000
export const REVIEW_TOPIC_MAX_CHARS = 100
export const REPORT_REASON_MAX_CHARS = 1000
export const CHECKIN_TIP_MAX_CHARS = 300
export const SAVED_NOTE_MAX_CHARS = 1000
export const SAVED_LIST_NAME_MAX_CHARS = 100

// Reference data (admin writes)
export const COMMON_INFO_MAX_CHARS = 2000
export const ORG_TYPE_KEY_MAX_CHARS = 50
export const ORG_TYPE_TITLE_MAX_CHARS = 100
export const SLUG_MAX_CHARS = 64

// Query-string filters
export const FILTER_MAX_CHARS = 100
export const FILTER_LIST_ITEMS_MAX = 20

/** Largest page of the caller's own lists (`GET /organisation/mine`, `GET /person/mine`). */
export const MINE_MAX_LIMIT = 100
/** Their page size when `limit` is not sent. */
export const MINE_DEFAULT_LIMIT = 20
