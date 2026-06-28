import Avatar from './Avatar'
import Icon from './Icon'

interface ConversationRowProps {
  initials: string
  color: string
  name: string
  isHelper?: boolean
  lastMessage: string
  time: string
  active?: boolean
  onClick?: () => void
}

export default function ConversationRow({
  initials,
  color,
  name,
  isHelper,
  lastMessage,
  time,
  active,
  onClick,
}: ConversationRowProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        gap: 12,
        padding: 13,
        borderRadius: 13,
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        background: active ? 'var(--surface)' : 'transparent',
        border: `1px solid ${active ? 'var(--ink-1)' : 'transparent'}`,
        boxShadow: active ? 'var(--shadow-1)' : 'none',
        marginBottom: 5,
      }}
    >
      <Avatar initials={initials} color={color} size={46} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span
            style={{
              font: '600 14.5px/1.2 var(--font-sans)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {name}
          </span>
          {isHelper && (
            <Icon name="verified" size={12} style={{ color: 'var(--type-helper)', flexShrink: 0 }} />
          )}
          <span style={{ font: '500 11px/1 var(--font-sans)', color: 'var(--ink-4)', flexShrink: 0 }}>
            {time}
          </span>
        </div>
        <div
          style={{
            font: '500 12.5px/1.4 var(--font-sans)',
            color: 'var(--ink-3)',
            marginTop: 5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {lastMessage}
        </div>
      </div>
    </button>
  )
}
