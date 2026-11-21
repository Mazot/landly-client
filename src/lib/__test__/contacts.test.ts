import { describe, expect, it } from 'vitest'
import { instagramUrl, phoneUrl, telegramUrl, websiteLabel, websiteUrl, whatsappUrl, withText } from '../contacts'

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
      expect(instagramUrl(value)).toMatch(/^https:\/\/instagram\.com\//)
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

  it('opens Instagram from a handle or a link', () => {
    expect(instagramUrl('@daria.k')).toBe('https://instagram.com/daria.k')
    expect(instagramUrl('daria.k')).toBe('https://instagram.com/daria.k')
    expect(instagramUrl('https://www.instagram.com/daria.k/')).toBe('https://www.instagram.com/daria.k/')
  })

  it('opens WhatsApp from a number or a link', () => {
    expect(whatsappUrl('+381 64 123 45 67')).toBe('https://wa.me/381641234567')
    expect(whatsappUrl('https://wa.me/1')).toBe('https://wa.me/1')
    expect(whatsappUrl('https://api.whatsapp.com/send?phone=1')).toBe('https://api.whatsapp.com/send?phone=1')
  })

  it("keeps a link only on the service's own hosts: a 'Telegram' button never opens another site", () => {
    expect(telegramUrl('https://evil.example/login')).toBe('https://t.me/evil.example')
    expect(telegramUrl('https://t.me.evil.example/x')).toBe('https://t.me/t.me.evil.example')
    expect(telegramUrl('https://telegram.me/landly')).toBe('https://telegram.me/landly')
    expect(instagramUrl('https://evil.example/daria')).toBe('https://instagram.com/evil.example')
    expect(whatsappUrl('https://evil.example/381641234567')).toBe('https://wa.me/381641234567')
    // A handle is a single path segment.
    expect(telegramUrl('landly/../../x')).toBe('https://t.me/landly')
    expect(instagramUrl('@daria k')).toBe('https://instagram.com/daria%20k')
    // Something that only looks like a link.
    expect(telegramUrl('https://')).toBe('https://t.me/')
  })

  it('adds the message to a WhatsApp link, whatever query it already has, with spaces as %20', () => {
    expect(withText('https://wa.me/1?lang=de&text=old', 'Hi there')).toBe('https://wa.me/1?lang=de&text=Hi%20there')
    expect(withText('https://wa.me/1', 'Hi')).toBe('https://wa.me/1?text=Hi')
  })
})
