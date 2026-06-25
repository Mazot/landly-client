/* Flag → arrow → flag (corridor visual). */
import Icon from './Icon'

interface FlagPairProps {
  fromFlag?: string | null
  toFlag?: string | null
  size?: number
  gap?: number
  arrowSize?: number
  arrowColor?: string
}

export default function FlagPair({
  fromFlag,
  toFlag,
  size = 17,
  gap = 7,
  arrowSize = 13,
  arrowColor = 'var(--ink-3)',
}: FlagPairProps) {
  return (
    <span className="inline-flex items-center" style={{ gap }}>
      <span style={{ fontSize: size, lineHeight: 1 }}>{fromFlag || '🏳️'}</span>
      <Icon name="arrowRight" size={arrowSize} style={{ color: arrowColor }} />
      <span style={{ fontSize: size, lineHeight: 1 }}>{toFlag || '🏳️'}</span>
    </span>
  )
}
