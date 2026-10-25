import { describe, expect, it } from 'vitest'
import { ORGANISATION_STATUSES, ORGANISATION_TYPE_SLUGS, PERSON_STATUSES } from '@/types/api'
import { isKnownOrgType, ORG_TYPE_CLASSES } from '../constants/orgTypes'
import { STATUS_TONES } from '../constants/status'
import { TONE_CLASSES, TONES } from '../constants/tones'

describe('DS constants', () => {
  it('has classes for every tone', () => {
    expect(Object.keys(TONE_CLASSES)).toEqual([...TONES])
  })

  it('styles every seeded org type slug', () => {
    expect(Object.keys(ORG_TYPE_CLASSES)).toEqual([...ORGANISATION_TYPE_SLUGS])
    expect(isKnownOrgType('embassy')).toBe(true)
    expect(isKnownOrgType('other')).toBe(false)
    expect(isKnownOrgType(null)).toBe(false)
  })

  it('has a tone for every organisation and person status', () => {
    expect(Object.keys(STATUS_TONES).sort()).toEqual([...new Set([...ORGANISATION_STATUSES, ...PERSON_STATUSES])].sort())
  })
})
