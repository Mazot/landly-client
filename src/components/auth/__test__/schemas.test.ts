import { describe, expect, it } from 'vitest'
import { firstErrorKey, signInSchema, signUpAccountSchema, signUpProfileSchema } from '../schemas'

const messages = (result: { success: boolean; error?: { issues: { message: string }[] } }) => result.error?.issues.map((i) => i.message) ?? []

describe('signInSchema', () => {
  it('accepts an email and any non-empty password, even a short one', () => {
    expect(signInSchema.safeParse({ email: ' Anna@Mail.com ', password: 'x' }).success).toBe(true)
  })

  it('asks for both fields', () => {
    expect(messages(signInSchema.safeParse({ email: '  ', password: '' }))).toEqual(['auth.errors.emailRequired', 'auth.errors.passwordRequired'])
  })

  it.each(['no-at-sign', 'a@b', `${'a'.repeat(250)}@x.io`])('rejects the malformed email %s', (email) => {
    expect(messages(signInSchema.safeParse({ email, password: 'x' }))).toEqual(['auth.errors.emailInvalid'])
  })
})

describe('signUpAccountSchema (user/entities.rs rules)', () => {
  const valid = { username: 'anna.m', email: 'anna@mail.com', password: 'password1' }

  it('accepts a valid account', () => {
    expect(signUpAccountSchema.safeParse(valid).success).toBe(true)
  })

  it.each([
    ['ab', 'auth.errors.usernameLength'],
    ['a'.repeat(51), 'auth.errors.usernameLength'],
    ['anna m', 'auth.errors.usernameSpaces'],
    ['anna\u0007m', 'auth.errors.usernameSpaces'],
  ])('rejects the username %j', (username, message) => {
    expect(messages(signUpAccountSchema.safeParse({ ...valid, username }))).toEqual([message])
  })

  it('counts username characters, not bytes, and trims it', () => {
    expect(signUpAccountSchema.safeParse({ ...valid, username: 'Анна' }).success).toBe(true)
    expect(signUpAccountSchema.safeParse({ ...valid, username: '  anna  ' }).success).toBe(true)
  })

  it('needs 8 characters but caps the password at 72 bytes (bcrypt)', () => {
    expect(messages(signUpAccountSchema.safeParse({ ...valid, password: 'short' }))).toEqual(['auth.errors.passwordShort'])
    expect(signUpAccountSchema.safeParse({ ...valid, password: 'я'.repeat(8) }).success).toBe(true)
    expect(signUpAccountSchema.safeParse({ ...valid, password: 'a'.repeat(72) }).success).toBe(true)
    expect(messages(signUpAccountSchema.safeParse({ ...valid, password: 'a'.repeat(73) }))).toEqual(['auth.errors.passwordLong'])
    expect(messages(signUpAccountSchema.safeParse({ ...valid, password: 'я'.repeat(37) }))).toEqual(['auth.errors.passwordLong'])
  })
})

describe('signUpProfileSchema', () => {
  const valid = { name: '', hereAs: 'newcomer', locale: 'en', avatarColor: '#4A6D8C' }

  it('everything is optional apart from valid enum values', () => {
    expect(signUpProfileSchema.safeParse(valid).success).toBe(true)
    expect(signUpProfileSchema.safeParse({ ...valid, hereAs: 'tourist' }).success).toBe(false)
    expect(signUpProfileSchema.safeParse({ ...valid, locale: 'de' }).success).toBe(false)
  })

  it('caps name (100) and avatar colour (32) like the server', () => {
    expect(messages(signUpProfileSchema.safeParse({ ...valid, name: 'a'.repeat(101) }))).toEqual(['auth.errors.nameLong'])
    expect(signUpProfileSchema.safeParse({ ...valid, avatarColor: 'a'.repeat(33) }).success).toBe(false)
  })
})

describe('firstErrorKey', () => {
  it('reads the first issue message, a plain string, or nothing', () => {
    expect(firstErrorKey([{ message: 'auth.errors.emailInvalid' }, { message: 'other' }])).toBe('auth.errors.emailInvalid')
    expect(firstErrorKey(['plain'])).toBe('plain')
    expect(firstErrorKey([])).toBeUndefined()
    expect(firstErrorKey([{ code: 1 }])).toBeUndefined()
    expect(firstErrorKey([undefined])).toBeUndefined()
  })
})
