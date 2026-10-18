// Contract values shared with landly-server. Each expectation mirrors a server
// source of truth (migration CHECK constraint, Rust validation constant or
// controller rule) — if one of these fails, the server changed or the client
// drifted; update both sides together.
import { describe, expect, it } from 'vitest'
import * as api from './index'

describe('enum values (migration CHECK constraints)', () => {
  it.each([
    ['ORGANISATION_STATUSES', 'organisations.status', ['pending', 'live', 'rejected']],
    ['ADDED_BY', 'organisations.added_by', ['official', 'community', 'volunteer']],
    ['COSTS', 'organisations.cost', ['free', 'paid']],
    ['LOCATION_SOURCES', 'organisations.location_source', ['google', 'user_pin', 'moderator']],
    ['PERSON_STATUSES', 'people.status', ['pending', 'awaiting', 'confirmed', 'claimed', 'declined']],
    ['SEND_VIA', 'people.send_via', ['email', 'whatsapp']],
    ['USER_ROLES', 'users.role', ['user', 'moderator', 'admin']],
    ['HERE_AS', 'users.here_as', ['newcomer', 'helping', 'exploring']],
    ['LOCALES', 'users.locale', ['en', 'ru', 'uk']],
    ['SAVED_KINDS', 'saved_items.kind', ['org', 'person', 'country', 'corridor']],
    ['REPORT_TARGET_KINDS', 'reports.target_kind', ['org', 'person', 'conversation']],
    ['REPORT_STATUSES', 'reports.status', ['open', 'resolved', 'dismissed']],
    ['MODERATION_KINDS', 'moderation_events.target_kind', ['org', 'person']],
    ['MODERATION_ACTIONS', 'moderation_events.action', ['submitted', 'approve', 'request_changes', 'reject']],
  ] as const)('%s = %s', (name, _column, values) => {
    expect(api[name]).toEqual(values)
  })
})

describe('values fixed in server code', () => {
  it('org type slugs seeded by the migration', () => {
    expect(api.ORGANISATION_TYPE_SLUGS).toEqual(['embassy', 'business', 'helper', 'community', 'volunteer'])
  })

  it('search sorts accepted by GET /organisation/search', () => {
    expect(api.SEARCH_SORTS).toEqual(['nearest', 'recent', 'verified'])
  })

  it('opening-hours weekday keys read by compute_open_now', () => {
    expect(api.WEEKDAYS).toEqual(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])
  })

  it('image upload: allowed MIME types and the 10 MB cap', () => {
    expect(api.IMAGE_CONTENT_TYPES).toEqual(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])
    expect(api.MAX_IMAGE_BYTES).toBe(10 * 1024 * 1024)
  })

  it('review rating range', () => {
    expect([api.MIN_RATING, api.MAX_RATING]).toEqual([1, 5])
  })

  it('credential and profile limits (user/entities.rs)', () => {
    expect({
      USERNAME_MIN_CHARS: api.USERNAME_MIN_CHARS,
      USERNAME_MAX_CHARS: api.USERNAME_MAX_CHARS,
      PASSWORD_MIN_CHARS: api.PASSWORD_MIN_CHARS,
      PASSWORD_MAX_BYTES: api.PASSWORD_MAX_BYTES,
      NAME_MAX_CHARS: api.NAME_MAX_CHARS,
      CITY_MAX_CHARS: api.CITY_MAX_CHARS,
      BIO_MAX_CHARS: api.BIO_MAX_CHARS,
      AVATAR_COLOR_MAX_CHARS: api.AVATAR_COLOR_MAX_CHARS,
    }).toEqual({
      USERNAME_MIN_CHARS: 3,
      USERNAME_MAX_CHARS: 50,
      PASSWORD_MIN_CHARS: 8,
      PASSWORD_MAX_BYTES: 72,
      NAME_MAX_CHARS: 100,
      CITY_MAX_CHARS: 100,
      BIO_MAX_CHARS: 1000,
      AVATAR_COLOR_MAX_CHARS: 32,
    })
  })
})
