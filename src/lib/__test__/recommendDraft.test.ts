import { describe, expect, it } from 'vitest'
import { toCreatePersonRequest, type RecommendFormValues } from '../recommendDraft'

const values = (over: Partial<RecommendFormValues> = {}): RecommendFormValues => ({
  name: '  Daria Kuznetsova ',
  city: ' ',
  bio: ' Helps with flats ',
  skills: ['Housing'],
  languageIds: ['l1'],
  whatsapp: ' +49 157 4410 2290 ',
  email: '',
  telegram: ' @daria ',
  instagram: '',
  sendVia: 'whatsapp',
  consent: true,
  ...over,
})

describe('toCreatePersonRequest', () => {
  it('trims the text, leaves empty fields out and carries the corridor country', () => {
    expect(toCreatePersonRequest(values(), 'de')).toEqual({
      name: 'Daria Kuznetsova',
      consent_given: true,
      city: undefined,
      bio: 'Helps with flats',
      skills: ['Housing'],
      language_ids: ['l1'],
      location_country_id: 'de',
      whatsapp: '+49 157 4410 2290',
      email: undefined,
      telegram: '@daria',
      instagram: undefined,
      send_via: 'whatsapp',
    })
  })

  it('sends the email contact and the chosen way', () => {
    expect(toCreatePersonRequest(values({ whatsapp: '', email: ' d@x.io ', sendVia: 'email' }))).toMatchObject({ email: 'd@x.io', whatsapp: undefined, send_via: 'email', location_country_id: undefined })
  })
})
