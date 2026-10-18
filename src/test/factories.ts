// Typed fixtures shaped exactly like landly-server payloads (`src/types/api`).
import type {
  AuthUser,
  Corridor,
  Country,
  OrganisationImage,
  Organisation,
  Person,
  Review,
  SavedItem,
  UserProfile,
} from '@/types/api'

let seq = 0
/** Deterministic, unique UUID-shaped id. */
export const uuid = () => `00000000-0000-4000-8000-${String(++seq).padStart(12, '0')}`

const NOW = '2026-10-18T09:12:44.123456'

export const authUser = (over: Partial<AuthUser> = {}): AuthUser => ({
  id: uuid(),
  username: 'daria',
  email: 'daria@example.com',
  token: 'jwt-token',
  ...over,
})

export const userProfile = (over: Partial<UserProfile> = {}): UserProfile => ({
  id: uuid(),
  username: 'daria',
  email: 'daria@example.com',
  role: 'user',
  name: null,
  bio: null,
  city: null,
  hereAs: null,
  homeCountryId: null,
  locale: 'en',
  avatarColor: null,
  notificationSettings: null,
  stats: { placesAdded: 0, peopleHelped: 0, peopleRecommended: 0, rating: null },
  ...over,
})

export const country = (over: Partial<Country> = {}): Country => ({
  id: uuid(),
  name: 'Germany',
  capitalCity: 'Berlin',
  description: null,
  flag: '🇩🇪',
  geoJson: null,
  currency: 'EUR',
  phoneCode: '+49',
  topCities: null,
  ...over,
})

export const organisation = (over: Partial<Organisation> = {}): Organisation => ({
  id: uuid(),
  name: 'Russian Embassy Berlin',
  status: 'live',
  description: null,
  address: null,
  city: 'Berlin',
  tel: null,
  email: null,
  website: null,
  telegram: null,
  whatsapp: null,
  latitude: 52.5163,
  longitude: 13.3777,
  locationSource: 'user_pin',
  googlePlaceId: null,
  locationCountryId: null,
  founderCountryId: null,
  organisationTypeId: null,
  addedBy: null,
  cost: null,
  languages: [],
  services: [],
  openingHours: null,
  timezone: null,
  openNow: null,
  verified: false,
  ratingAvg: null,
  reviewsCount: 0,
  visitsCount: 0,
  createdBy: null,
  createdAt: NOW,
  updatedAt: NOW,
  ...over,
})

export const image = (over: Partial<OrganisationImage> = {}): OrganisationImage => ({
  id: uuid(),
  organisationId: uuid(),
  fileName: 'photo.jpg',
  contentType: 'image/jpeg',
  fileSize: 1024,
  width: null,
  height: null,
  isPrimary: false,
  url: 'http://cdn.test/photo.jpg',
  createdAt: NOW,
  updatedAt: NOW,
  ...over,
})

export const corridor = (over: Partial<Corridor> = {}): Corridor => ({
  id: uuid(),
  fromCountryId: uuid(),
  toCountryId: uuid(),
  isDefault: false,
  createdAt: NOW,
  ...over,
})

export const person = (over: Partial<Person> = {}): Person => ({
  id: uuid(),
  name: 'Daria K.',
  status: 'confirmed',
  bio: null,
  city: null,
  locationCountryId: null,
  skills: [],
  languageIds: [],
  allowReviews: true,
  ratingAvg: null,
  reviewsCount: 0,
  vouches: 0,
  createdAt: NOW,
  ...over,
})

export const review = (over: Partial<Review> = {}): Review => ({
  id: uuid(),
  authorId: uuid(),
  organisationId: uuid(),
  personId: null,
  rating: 5,
  text: null,
  topic: null,
  createdAt: NOW,
  ...over,
})

export const savedItem = (over: Partial<SavedItem> = {}): SavedItem => ({
  id: uuid(),
  kind: 'org',
  targetId: uuid(),
  listName: null,
  note: null,
  createdAt: NOW,
  ...over,
})

/** `{ items, total }` envelope of list endpoints. */
export const list = <T>(items: T[]) => ({ items, total: items.length })
