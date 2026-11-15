// The recommend-someone form ↔ `POST /api/person/create`.
import type { CreatePersonRequest, SendVia, Uuid } from '@/types/api'

export interface RecommendFormValues {
  name: string
  city: string
  bio: string
  /** Skill names, as `GET /person/skills` names them. */
  skills: string[]
  languageIds: Uuid[]
  /** The phone, reached on WhatsApp. */
  whatsapp: string
  email: string
  /** A handle ("@daria") or a link. */
  telegram: string
  /** A handle ("daria.k") or a link. */
  instagram: string
  /** Which contact the recommender sends the claim link through. */
  sendVia: SendVia
  /** The recommender asked the person before sharing their contacts. */
  consent: boolean
}

const text = (value: string) => value.trim() || undefined

/** The create request: trimmed text, empty fields left out, the country the corridor leads to. The person decides what to publish when they confirm. */
export function toCreatePersonRequest(values: RecommendFormValues, countryId?: Uuid): CreatePersonRequest {
  return {
    name: values.name.trim(),
    consent_given: values.consent,
    city: text(values.city),
    bio: text(values.bio),
    skills: values.skills,
    language_ids: values.languageIds,
    location_country_id: countryId,
    whatsapp: text(values.whatsapp),
    email: text(values.email),
    telegram: text(values.telegram),
    instagram: text(values.instagram),
    send_via: values.sendVia,
  }
}
