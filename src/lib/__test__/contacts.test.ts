import { describe, expect, it } from 'vitest'
import { phoneUrl, telegramUrl, websiteLabel, websiteUrl, whatsappUrl } from '../contacts'

describe('contact links', () => {
  it('opens a website with or without its scheme, and shows it without one', () => {
    expect(websiteUrl('example.org/a')).toBe('https://example.org/a')
    expect(websiteUrl('http://example.org')).toBe('http://example.org')
    expect(websiteLabel('https://example.org/')).toBe('example.org')
  })

  it('calls the digits of a phone number', () => {
    expect(phoneUrl('+49 30 1234-567')).toBe('tel:+49301234567')
  })

  it('opens Telegram from a handle or a link', () => {
    expect(telegramUrl('@landly')).toBe('https://t.me/landly')
    expect(telegramUrl('landly')).toBe('https://t.me/landly')
    expect(telegramUrl('https://t.me/landly')).toBe('https://t.me/landly')
  })

  it('opens WhatsApp from a number or a link', () => {
    expect(whatsappUrl('+381 64 123 45 67')).toBe('https://wa.me/381641234567')
    expect(whatsappUrl('https://wa.me/1')).toBe('https://wa.me/1')
  })
})
