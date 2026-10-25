// Every service method against its landly-server route: HTTP method, path,
// query string, JSON body, and that the answer is returned as-is.
import { describe, expect, it } from 'vitest'
import { capture, type MultipartParts } from '@/test/server'
import { commonApi } from '../common.service'
import { corridorApi } from '../corridor.service'
import { countryConnectionApi } from '../country-connection.service'
import { healthcheckApi } from '../healthcheck.service'
import { imageApi } from '../image.service'
import { moderationApi } from '../moderation.service'
import { organisationApi } from '../organisation.service'
import { personApi } from '../person.service'
import { reportApi } from '../report.service'
import { reviewApi } from '../review.service'
import { savedApi } from '../saved.service'
import { GOOGLE_CALLBACK_PATH, GOOGLE_LOGIN_URL, userApi } from '../user.service'

type Method = 'get' | 'post' | 'put' | 'delete'

interface Case {
  name: string
  call: () => Promise<unknown>
  method: Method
  path: string
  query?: Record<string, string>
  body?: unknown
  /** What the server answers; `null` for empty `"OK"`-style answers. */
  response?: unknown
  /** The method resolves to `undefined` (void) instead of the answer. */
  void?: true
}

const ID = '11111111-1111-4111-8111-111111111111'
const OK = { ok: true }

const cases: Case[] = [
  // healthcheck
  { name: 'healthcheck.check', call: () => healthcheckApi.check(), method: 'get', path: '/api/healthcheck', response: 'Healthcheck' },

  // common
  { name: 'common.getCountries', call: () => commonApi.getCountries({ name: 'ger', limit: 20, offset: 0 }), method: 'get', path: '/api/common/countries', query: { name: 'ger', limit: '20', offset: '0' }, response: [OK] },
  { name: 'common.getCountry', call: () => commonApi.getCountry(ID), method: 'get', path: `/api/common/countries/${ID}`, response: OK },
  { name: 'common.getLanguages', call: () => commonApi.getLanguages({ limit: 500 }), method: 'get', path: '/api/common/languages', query: { limit: '500' }, response: [OK] },
  { name: 'common.getOrganisationTypes', call: () => commonApi.getOrganisationTypes(), method: 'get', path: '/api/common/org_types', response: [OK] },
  { name: 'common.createOrganisationType', call: () => commonApi.createOrganisationType({ org_type: 'embassy', title: 'Embassy', color: '#4A6D8C' }), method: 'post', path: '/api/common/org_types', body: { org_type: 'embassy', title: 'Embassy', color: '#4A6D8C' }, response: OK },

  // organisation
  { name: 'organisation.list', call: () => organisationApi.list({ name: 'emb', limit: 10 }), method: 'get', path: '/api/organisation/list', query: { name: 'emb', limit: '10' }, response: { items: [], total: 0 } },
  { name: 'organisation.search', call: () => organisationApi.search({ lat: 52.5, lng: 13.4, types: ['embassy', 'helper'], open_now: true, sort: 'nearest' }), method: 'get', path: '/api/organisation/search', query: { lat: '52.5', lng: '13.4', types: 'embassy,helper', open_now: 'true', sort: 'nearest' }, response: { items: [], total: 0 } },
  { name: 'organisation.fetch', call: () => organisationApi.fetch(ID), method: 'get', path: `/api/organisation/fetch/${ID}`, response: OK },
  { name: 'organisation.create', call: () => organisationApi.create({ name: 'Embassy', google_place_id: 'p1', latitude: 1, longitude: 2 }), method: 'post', path: '/api/organisation/create', body: { name: 'Embassy', google_place_id: 'p1', latitude: 1, longitude: 2 }, response: OK },
  { name: 'organisation.update', call: () => organisationApi.update(ID, { name: 'Renamed' }), method: 'put', path: `/api/organisation/update/${ID}`, body: { name: 'Renamed' }, response: OK },
  { name: 'organisation.remove', call: () => organisationApi.remove(ID), method: 'delete', path: `/api/organisation/delete/${ID}`, response: 'OK', void: true },
  { name: 'organisation.checkin', call: () => organisationApi.checkin(ID, { tip: 'Bring a passport photo' }), method: 'post', path: `/api/organisation/checkin/${ID}`, body: { tip: 'Bring a passport photo' }, response: OK },
  { name: 'organisation.checkin (default body)', call: () => organisationApi.checkin(ID), method: 'post', path: `/api/organisation/checkin/${ID}`, body: {}, response: OK },
  { name: 'organisation.visit', call: () => organisationApi.visit(ID), method: 'post', path: `/api/organisation/visit/${ID}`, response: { visitsCount: 3 } },

  // images
  { name: 'image.list', call: () => imageApi.list(ID, { limit: 5 }), method: 'get', path: `/api/images/list/${ID}`, query: { limit: '5' }, response: { items: [], total: 0 } },
  { name: 'image.fetch', call: () => imageApi.fetch(ID), method: 'get', path: `/api/images/fetch/${ID}`, response: OK },
  { name: 'image.setPrimary', call: () => imageApi.setPrimary(ID), method: 'put', path: `/api/images/set-primary/${ID}`, response: OK },
  { name: 'image.remove', call: () => imageApi.remove(ID), method: 'delete', path: `/api/images/delete/${ID}`, response: 'OK', void: true },

  // corridor
  { name: 'corridor.list', call: () => corridorApi.list(), method: 'get', path: '/api/corridor/list', response: { items: [], total: 0 } },
  { name: 'corridor.create', call: () => corridorApi.create({ from_country_id: 'a', to_country_id: 'b', is_default: true }), method: 'post', path: '/api/corridor/create', body: { from_country_id: 'a', to_country_id: 'b', is_default: true }, response: OK },
  { name: 'corridor.setDefault', call: () => corridorApi.setDefault(ID), method: 'put', path: `/api/corridor/set-default/${ID}`, response: OK },
  { name: 'corridor.stats', call: () => corridorApi.stats(ID), method: 'get', path: `/api/corridor/stats/${ID}`, response: OK },
  { name: 'corridor.remove', call: () => corridorApi.remove(ID), method: 'delete', path: `/api/corridor/delete/${ID}`, response: 'OK', void: true },

  // country connection
  { name: 'countryConnection.list', call: () => countryConnectionApi.list({ location_country_id: ID }), method: 'get', path: '/api/country-connection/list', query: { location_country_id: ID }, response: { items: [], total: 0 } },
  { name: 'countryConnection.fetch', call: () => countryConnectionApi.fetch(ID), method: 'get', path: `/api/country-connection/fetch/${ID}`, response: OK },
  { name: 'countryConnection.create', call: () => countryConnectionApi.create({ common_info: 'Consular hours' }), method: 'post', path: '/api/country-connection/create', body: { common_info: 'Consular hours' }, response: OK },
  { name: 'countryConnection.update', call: () => countryConnectionApi.update(ID, { common_info: 'New hours' }), method: 'put', path: `/api/country-connection/update/${ID}`, body: { common_info: 'New hours' }, response: OK },
  { name: 'countryConnection.remove', call: () => countryConnectionApi.remove(ID), method: 'delete', path: `/api/country-connection/delete/${ID}`, response: 'OK', void: true },

  // user
  { name: 'user.signIn', call: () => userApi.signIn({ email: 'a@b.c', password: 'secret123' }), method: 'post', path: '/api/user/signin', body: { email: 'a@b.c', password: 'secret123' }, response: OK },
  { name: 'user.signUp', call: () => userApi.signUp({ username: 'daria', email: 'a@b.c', password: 'secret123', locale: 'ru' }), method: 'post', path: '/api/user/signup', body: { username: 'daria', email: 'a@b.c', password: 'secret123', locale: 'ru' }, response: OK },
  { name: 'user.exchangeGoogleCode', call: () => userApi.exchangeGoogleCode({ code: 'one-time' }), method: 'post', path: '/api/user/oauth/google/exchange', body: { code: 'one-time' }, response: OK },
  { name: 'user.getMe', call: () => userApi.getMe(), method: 'get', path: '/api/user/me', response: OK },
  { name: 'user.updateMe', call: () => userApi.updateMe({ city: 'Berlin' }), method: 'put', path: '/api/user/me', body: { city: 'Berlin' }, response: OK },
  { name: 'user.updateNotifications', call: () => userApi.updateNotifications({ notification_settings: { email: false } }), method: 'put', path: '/api/user/me/notifications', body: { notification_settings: { email: false } }, response: OK },
  { name: 'user.getLanguages', call: () => userApi.getLanguages(ID), method: 'get', path: `/api/user/${ID}/languages`, response: OK },
  { name: 'user.addLanguages', call: () => userApi.addLanguages({ languages_ids: [ID] }), method: 'post', path: '/api/user/languages', body: { languages_ids: [ID] }, response: OK },
  { name: 'user.deleteLanguage (JSON body on DELETE)', call: () => userApi.deleteLanguage({ language_id: ID }), method: 'delete', path: '/api/user/languages', body: { language_id: ID }, response: 'OK', void: true },

  // person
  { name: 'person.list', call: () => personApi.list({ skills: ['Housing', 'Language'], language_ids: [ID], city: 'Ber' }), method: 'get', path: '/api/person/list', query: { skills: 'Housing,Language', language_ids: ID, city: 'Ber' }, response: { items: [], total: 0 } },
  { name: 'person.fetch', call: () => personApi.fetch(ID), method: 'get', path: `/api/person/fetch/${ID}`, response: OK },
  { name: 'person.create', call: () => personApi.create({ name: 'Daria K.', consent_given: true, email: 'd@x.io' }), method: 'post', path: '/api/person/create', body: { name: 'Daria K.', consent_given: true, email: 'd@x.io' }, response: OK },
  { name: 'person.vouch', call: () => personApi.vouch(ID, { note: 'Helped me' }), method: 'post', path: `/api/person/vouch/${ID}`, body: { note: 'Helped me' }, response: OK },
  { name: 'person.vouch (default body)', call: () => personApi.vouch(ID), method: 'post', path: `/api/person/vouch/${ID}`, body: {}, response: OK },
  { name: 'person.getClaim', call: () => personApi.getClaim('tok'), method: 'get', path: '/api/person/claim/tok', response: OK },
  { name: 'person.confirmClaim', call: () => personApi.confirmClaim('tok', { show_email: true }), method: 'post', path: '/api/person/claim/tok/confirm', body: { show_email: true }, response: OK },
  { name: 'person.confirmClaim (default body)', call: () => personApi.confirmClaim('tok'), method: 'post', path: '/api/person/claim/tok/confirm', body: {}, response: OK },
  { name: 'person.declineClaim', call: () => personApi.declineClaim('tok'), method: 'post', path: '/api/person/claim/tok/decline', response: 'OK', void: true },

  // review
  { name: 'review.list', call: () => reviewApi.list({ organisation_id: ID, limit: 5 }), method: 'get', path: '/api/review/list', query: { organisation_id: ID, limit: '5' }, response: { items: [], total: 0 } },
  { name: 'review.create', call: () => reviewApi.create({ person_id: ID, rating: 5, topic: 'Anmeldung help' }), method: 'post', path: '/api/review/create', body: { person_id: ID, rating: 5, topic: 'Anmeldung help' }, response: OK },
  { name: 'review.remove', call: () => reviewApi.remove(ID), method: 'delete', path: `/api/review/delete/${ID}`, response: 'OK', void: true },

  // saved
  { name: 'saved.list', call: () => savedApi.list({ kind: 'org' }), method: 'get', path: '/api/saved/list', query: { kind: 'org' }, response: { items: [], total: 0 } },
  { name: 'saved.counts', call: () => savedApi.counts(), method: 'get', path: '/api/saved/counts', response: OK },
  { name: 'saved.create', call: () => savedApi.create({ kind: 'person', target_id: ID, note: 'call later' }), method: 'post', path: '/api/saved/create', body: { kind: 'person', target_id: ID, note: 'call later' }, response: OK },
  { name: 'saved.remove', call: () => savedApi.remove(ID), method: 'delete', path: `/api/saved/delete/${ID}`, response: 'OK', void: true },

  // report
  { name: 'report.create', call: () => reportApi.create({ target_kind: 'org', target_id: ID, reason: 'Closed' }), method: 'post', path: '/api/report/create', body: { target_kind: 'org', target_id: ID, reason: 'Closed' }, response: OK },

  // moderation
  { name: 'moderation.queue', call: () => moderationApi.queue({ kind: 'person' }), method: 'get', path: '/api/moderation/queue', query: { kind: 'person' }, response: { items: [], total: 0 } },
  { name: 'moderation.approve', call: () => moderationApi.approve({ kind: 'org', target_id: ID }), method: 'post', path: '/api/moderation/approve', body: { kind: 'org', target_id: ID }, response: 'OK', void: true },
  { name: 'moderation.requestChanges', call: () => moderationApi.requestChanges({ kind: 'org', target_id: ID, note: 'Add hours' }), method: 'post', path: '/api/moderation/request-changes', body: { kind: 'org', target_id: ID, note: 'Add hours' }, response: 'OK', void: true },
  { name: 'moderation.reject', call: () => moderationApi.reject({ kind: 'person', target_id: ID, note: 'Spam' }), method: 'post', path: '/api/moderation/reject', body: { kind: 'person', target_id: ID, note: 'Spam' }, response: 'OK', void: true },
]

describe('services', () => {
  it.each(cases)('$name → $method $path', async (c) => {
    const requests = capture(c.method, c.path, c.response ?? null)

    const result = await c.call()

    expect(requests).toHaveLength(1)
    const [req] = requests
    expect(req.method).toBe(c.method.toUpperCase())
    expect(Object.fromEntries(req.query)).toEqual(c.query ?? {})
    expect(req.body).toEqual(c.body)
    expect(result).toEqual(c.void ? undefined : c.response)
  })

  it('covers every service method', () => {
    const apis = { commonApi, corridorApi, countryConnectionApi, healthcheckApi, imageApi, moderationApi, organisationApi, personApi, reportApi, reviewApi, savedApi, userApi }
    const methods = Object.values(apis).reduce((n, api) => n + Object.keys(api).length, 0)
    const tested = new Set(cases.map((c) => c.name.split(' ')[0]))
    // imageApi.upload is covered separately (multipart) below.
    expect(tested.size + 1).toBe(methods)
  })
})

describe('imageApi.upload', () => {
  it('posts multipart with `file` and `is_primary`, letting the browser set the boundary', async () => {
    const requests = capture('post', `/api/images/upload/${ID}`, OK)
    const file = new File(['jpeg-bytes'], 'photo.jpg', { type: 'image/jpeg' })

    const result = await imageApi.upload(ID, { file, isPrimary: true })

    const [req] = requests
    expect(req.headers.get('content-type')).toMatch(/^multipart\/form-data; boundary=/)
    const parts = req.body as MultipartParts
    expect(parts.is_primary.value).toBe('true')
    expect(parts.file).toEqual({ value: 'jpeg-bytes', filename: 'photo.jpg', contentType: 'image/jpeg' })
    expect(result).toEqual(OK)
  })

  it('defaults is_primary to false', async () => {
    const requests = capture('post', `/api/images/upload/${ID}`, OK)
    await imageApi.upload(ID, { file: new File(['x'], 'a.png', { type: 'image/png' }) })
    expect((requests[0].body as MultipartParts).is_primary.value).toBe('false')
  })
})

describe('personApi claim token', () => {
  it('URL-encodes the token', async () => {
    const requests = capture('get', '/api/person/claim/a%2Fb%3Fc', OK)
    await personApi.getClaim('a/b?c')
    expect(requests[0].path).toBe('/api/person/claim/a%2Fb%3Fc')
  })
})

describe('Google sign-in', () => {
  it('navigates to the server login route on the API origin', () => {
    expect(GOOGLE_LOGIN_URL).toBe('http://api.test/api/user/oauth/google/login')
  })

  it('expects the server to redirect back to /auth/google/callback', () => {
    expect(GOOGLE_CALLBACK_PATH).toBe('/auth/google/callback')
  })
})
