import Button from './Button'
import Icon from './Icon'

interface MessageComposerProps {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  placeholder?: string
  attachLabel?: string
  sendLabel?: string
}

export default function MessageComposer({
  value,
  onChange,
  onSend,
  placeholder = 'Write a message…',
  attachLabel = 'Attach file',
  sendLabel = 'Send',
}: MessageComposerProps) {
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border-1)',
        flexShrink: 0,
      }}
    >
      <Button iconButton variant="ghost" size="sm" aria-label={attachLabel}>
        <Icon name="plus" size={15} />
      </Button>
      <input
        className="l-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        style={{ flex: 1, height: 42, background: 'var(--surface-2)', fontSize: 14 }}
      />
      <button
        className="l-btn accent icon"
        style={{ width: 42, height: 42, borderRadius: 999, flexShrink: 0, opacity: value.trim() ? 1 : 0.4 }}
        disabled={!value.trim()}
        onClick={onSend}
        aria-label={sendLabel}
      >
        <Icon name="arrowRight" size={15} stroke={2} />
      </button>
    </div>
  )
}
