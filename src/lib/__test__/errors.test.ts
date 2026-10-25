import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { describe, expect, it } from 'vitest'
import { apiErrorConstraint, apiErrorMessage, apiErrorStatus } from '../errors'

const httpError = (status: number, data: unknown, message = 'Request failed') =>
  new AxiosError(message, 'ERR_BAD_RESPONSE', undefined, undefined, {
    status,
    data,
    statusText: '',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  } as AxiosResponse)

describe('apiErrorStatus', () => {
  it('returns the HTTP status of an answered request', () => {
    expect(apiErrorStatus(httpError(422, { error: 'bad' }))).toBe(422)
  })

  it('is undefined without a response or for non-axios errors', () => {
    expect(apiErrorStatus(new AxiosError('Network Error'))).toBeUndefined()
    expect(apiErrorStatus(new Error('boom'))).toBeUndefined()
  })
})

describe('apiErrorMessage', () => {
  it('reads `{ error }` bodies', () => {
    expect(apiErrorMessage(httpError(401, { error: 'Invalid email or password' }))).toBe('Invalid email or password')
  })

  it('reads plain-string bodies (500, extractor errors, rate limit)', () => {
    expect(apiErrorMessage(httpError(500, 'Internal Server Error'))).toBe('Internal Server Error')
  })

  it('falls back to the axios message for an empty string or an unknown body', () => {
    expect(apiErrorMessage(httpError(429, ''))).toBeUndefined()
    expect(apiErrorMessage(httpError(400, { unexpected: true }, 'Request failed with status code 400'))).toBe(
      'Request failed with status code 400',
    )
    expect(apiErrorMessage(new AxiosError('Network Error'))).toBe('Network Error')
  })

  it('is undefined for non-axios errors', () => {
    expect(apiErrorMessage(new Error('boom'))).toBeUndefined()
  })
})

describe('apiErrorConstraint', () => {
  it('returns the violated DB constraint of a 422', () => {
    expect(
      apiErrorConstraint(httpError(422, { error: 'duplicate value', constraint: 'users_email_lower_key' })),
    ).toBe('users_email_lower_key')
  })

  it('is undefined for string bodies, bodies without it and non-axios errors', () => {
    expect(apiErrorConstraint(httpError(500, 'Internal Server Error'))).toBeUndefined()
    expect(apiErrorConstraint(httpError(422, { error: 'bad' }))).toBeUndefined()
    expect(apiErrorConstraint(new Error('boom'))).toBeUndefined()
  })
})
