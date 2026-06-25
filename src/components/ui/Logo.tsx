/* Landly logo — dark circle + ring pin + terracotta dot + smile arc, with wordmark. */

interface LogoProps {
  size?: number
  /** 'full' shows the wordmark; 'mark' shows just the glyph. */
  mark?: 'full' | 'mark'
  /** Wordmark colour (defaults to ink-1; pass '#fff' for dark backgrounds). */
  wordColor?: string
}

export default function Logo({ size = 28, mark = 'full', wordColor = 'var(--ink-1)' }: LogoProps) {
  return (
    <span className="inline-flex items-center" style={{ gap: 9 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="15" fill="#1B1A17" />
        <circle cx="16" cy="13" r="6.5" fill="none" stroke="#F6F4EF" strokeWidth="1.6" />
        <circle cx="16" cy="13" r="2.4" fill="#D97757" />
        <path d="M10 22.5 C 12 26, 20 26, 22 22.5" stroke="#F6F4EF" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
      {mark === 'full' && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: size * 0.86,
            lineHeight: 1,
            color: wordColor,
            letterSpacing: '-0.01em',
          }}
        >
          landly
        </span>
      )}
    </span>
  )
}
