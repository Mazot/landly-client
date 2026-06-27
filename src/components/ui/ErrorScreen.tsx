/* Branded fallback shown by ErrorBoundary when a route crashes. */
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import Button from './Button'

export default function ErrorScreen() {
  const { t } = useTranslation()
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ height: '100vh', background: 'var(--bg)', gap: 16, padding: 24, textAlign: 'center' }}
    >
      <Logo size={32} />
      <h1 style={{ font: '600 22px/1.2 var(--font-sans)', color: 'var(--ink-1)', margin: 0 }}>{t('error.title')}</h1>
      <p style={{ font: '400 14px/1.6 var(--font-sans)', color: 'var(--ink-3)', maxWidth: 360, margin: 0 }}>{t('error.body')}</p>
      <Button variant="accent" onClick={() => window.location.reload()}>{t('error.reload')}</Button>
    </div>
  )
}
