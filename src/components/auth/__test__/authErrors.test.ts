import { AxiosError, type AxiosResponse } from 'axios'
import { describe, expect, it } from 'vitest'
import { authFailure, signupConflict } from '../authErrors'

const failed = (status: number, data: unknown = {}) => new AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, { status, data } as AxiosResponse)

describe('authFailure', () => {
  it.each([
    [401, 'invalidCredentials'],
    [429, 'tooManyRequests'],
    [500, 'generic'],
    [422, 'generic'],
  ] as const)('maps HTTP %i to %s', (status, expected) => {
    expect(authFailure(failed(status))).toBe(expected)
  })

  it('treats a request that got no answer as a network problem', () => {
    expect(authFailure(new AxiosError('Network Error'))).toBe('network')
    expect(authFailure(new Error('boom'))).toBe('network')
  })
})

describe('signupConflict', () => {
  it.each([
    ['users_username_key', 'username'],
    ['users_email_key', 'email'],
    ['users_email_lower_key', 'email'],
  ] as const)('422 on %s points at the %s field', (constraint, field) => {
    expect(signupConflict(failed(422, { error: 'x', constraint }))).toBe(field)
  })

  it('ignores other constraints, other statuses and bodies without a constraint', () => {
    expect(signupConflict(failed(422, { error: 'x', constraint: 'corridors_user_id_key' }))).toBeUndefined()
    expect(signupConflict(failed(422, { error: 'Invalid email address' }))).toBeUndefined()
    expect(signupConflict(failed(500, { error: 'x', constraint: 'users_username_key' }))).toBeUndefined()
    expect(signupConflict(new Error('boom'))).toBeUndefined()
  })
})
