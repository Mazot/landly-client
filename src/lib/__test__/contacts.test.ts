import { describe, expect, it } from 'vitest'
import { phoneUrl, telegramUrl, websiteLabel, websiteUrl, whatsappUrl } from '../contacts'

describe('contact links', () => {
  it('opens a website with or without its scheme, and shows it without one', () => {
    expect(websiteUrl('example.org/a')).toBe('https://example.org/a')
    expect(websiteUrl('http://example.org')).toBe('http://example.org')
    expect(websiteLabel('https://example.org/')).toBe('example.org')
  })

  it('never keeps a scheme other than http(s): a stored javascript: link must not run', () => {
    for (const value of ['javascript://%0aalert(1)', 'data://text/html,x', 'JavaScript://x']) {
      expect(websiteUrl(value)).toBe(`https://${value}`)
      expect(telegramUrl(value)).toMatch(/^https:\/\/t\.me\//)
      expect(whatsappUrl(value)).toMatch(/^https:\/\/wa\.me\//)
    }
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
