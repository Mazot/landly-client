// Contract values shared with landly-server. Each expectation mirrors a server
// source of truth (migration CHECK constraint, Rust validation constant or
// controller rule) — if one of these fails, the server changed or the client
// drifted; update both sides together.
import { describe, expect, it } from 'vitest'
import * as api from '../';

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
      EMAIL_MAX_CHARS: api.EMAIL_MAX_CHARS,
      NAME_MAX_CHARS: api.NAME_MAX_CHARS,
      CITY_MAX_CHARS: api.CITY_MAX_CHARS,
      BIO_MAX_CHARS: api.BIO_MAX_CHARS,
      AVATAR_COLOR_MAX_CHARS: api.AVATAR_COLOR_MAX_CHARS,
    }).toEqual({
      USERNAME_MIN_CHARS: 3,
      USERNAME_MAX_CHARS: 50,
      PASSWORD_MIN_CHARS: 8,
      PASSWORD_MAX_BYTES: 72,
      EMAIL_MAX_CHARS: 254,
      NAME_MAX_CHARS: 100,
      CITY_MAX_CHARS: 100,
      BIO_MAX_CHARS: 1000,
      AVATAR_COLOR_MAX_CHARS: 32,
    })
  })

  it('input caps (utils/validation.rs → limits, MAX_JSON_BODY_BYTES)', () => {
    expect({
      MAX_JSON_BODY_BYTES: api.MAX_JSON_BODY_BYTES,
      ORG_NAME_MAX_CHARS: api.ORG_NAME_MAX_CHARS,
      PHONE_MAX_CHARS: api.PHONE_MAX_CHARS,
      ADDRESS_MAX_CHARS: api.ADDRESS_MAX_CHARS,
      URL_MAX_CHARS: api.URL_MAX_CHARS,
      HANDLE_MAX_CHARS: api.HANDLE_MAX_CHARS,
      DESCRIPTION_MAX_CHARS: api.DESCRIPTION_MAX_CHARS,
      TIMEZONE_MAX_CHARS: api.TIMEZONE_MAX_CHARS,
      TAG_MAX_CHARS: api.TAG_MAX_CHARS,
      TAGS_PER_LIST_MAX: api.TAGS_PER_LIST_MAX,
      JSON_DOCUMENT_MAX_BYTES: api.JSON_DOCUMENT_MAX_BYTES,
      PERSON_NAME_MAX_CHARS: api.PERSON_NAME_MAX_CHARS,
      PERSON_BIO_MAX_CHARS: api.PERSON_BIO_MAX_CHARS,
      SKILLS_MAX: api.SKILLS_MAX,
      LANGUAGE_IDS_MAX: api.LANGUAGE_IDS_MAX,
      VOUCH_NOTE_MAX_CHARS: api.VOUCH_NOTE_MAX_CHARS,
      REVIEW_TEXT_MAX_CHARS: api.REVIEW_TEXT_MAX_CHARS,
      REVIEW_TOPIC_MAX_CHARS: api.REVIEW_TOPIC_MAX_CHARS,
      REPORT_REASON_MAX_CHARS: api.REPORT_REASON_MAX_CHARS,
      CHECKIN_TIP_MAX_CHARS: api.CHECKIN_TIP_MAX_CHARS,
      SAVED_NOTE_MAX_CHARS: api.SAVED_NOTE_MAX_CHARS,
      SAVED_LIST_NAME_MAX_CHARS: api.SAVED_LIST_NAME_MAX_CHARS,
      COMMON_INFO_MAX_CHARS: api.COMMON_INFO_MAX_CHARS,
      ORG_TYPE_KEY_MAX_CHARS: api.ORG_TYPE_KEY_MAX_CHARS,
      ORG_TYPE_TITLE_MAX_CHARS: api.ORG_TYPE_TITLE_MAX_CHARS,
      SLUG_MAX_CHARS: api.SLUG_MAX_CHARS,
      FILTER_MAX_CHARS: api.FILTER_MAX_CHARS,
      FILTER_LIST_ITEMS_MAX: api.FILTER_LIST_ITEMS_MAX,
    }).toEqual({
      MAX_JSON_BODY_BYTES: 64 * 1024,
      ORG_NAME_MAX_CHARS: 200,
      PHONE_MAX_CHARS: 32,
      ADDRESS_MAX_CHARS: 300,
      URL_MAX_CHARS: 2048,
      HANDLE_MAX_CHARS: 100,
      DESCRIPTION_MAX_CHARS: 2000,
      TIMEZONE_MAX_CHARS: 64,
      TAG_MAX_CHARS: 60,
      TAGS_PER_LIST_MAX: 30,
      JSON_DOCUMENT_MAX_BYTES: 4 * 1024,
      PERSON_NAME_MAX_CHARS: 100,
      PERSON_BIO_MAX_CHARS: 1000,
      SKILLS_MAX: 20,
      LANGUAGE_IDS_MAX: 30,
      VOUCH_NOTE_MAX_CHARS: 500,
      REVIEW_TEXT_MAX_CHARS: 2000,
      REVIEW_TOPIC_MAX_CHARS: 100,
      REPORT_REASON_MAX_CHARS: 1000,
      CHECKIN_TIP_MAX_CHARS: 300,
      SAVED_NOTE_MAX_CHARS: 1000,
      SAVED_LIST_NAME_MAX_CHARS: 100,
      COMMON_INFO_MAX_CHARS: 2000,
      ORG_TYPE_KEY_MAX_CHARS: 50,
      ORG_TYPE_TITLE_MAX_CHARS: 100,
      SLUG_MAX_CHARS: 64,
      FILTER_MAX_CHARS: 100,
      FILTER_LIST_ITEMS_MAX: 20,
    })
  })

  it('signup unique-violation constraints (users table + users_email_lower_key migration)', () => {
    expect(api.SIGNUP_CONFLICT_CONSTRAINTS).toEqual({
      username: ['users_username_key'],
      email: ['users_email_key', 'users_email_lower_key'],
    })
  })
})
