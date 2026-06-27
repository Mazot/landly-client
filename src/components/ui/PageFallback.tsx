/* Suspense fallback while a lazily-loaded route chunk downloads. */
import Logo from './Logo'

export default function PageFallback() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ height: '100vh', background: 'var(--bg)' }}
    >
      <div style={{ opacity: 0.45 }}>
        <Logo size={34} />
      </div>
    </div>
  )
}
