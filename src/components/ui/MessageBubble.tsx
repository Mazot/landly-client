interface MessageBubbleProps {
  me: boolean
  text: string
  time: string
}

export default function MessageBubble({ me, text, time }: MessageBubbleProps) {
  return (
    <div style={{ display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
      <div
        style={{
          maxWidth: '78%',
          padding: '10px 13px',
          borderRadius: me ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          background: me ? 'var(--ink-1)' : 'var(--surface)',
          color: me ? '#fff' : 'var(--ink-1)',
          border: me ? 'none' : '1px solid var(--border-1)',
        }}
      >
        <p style={{ font: '400 13.5px/1.5 var(--font-sans)', margin: 0 }}>{text}</p>
        <span
          style={{
            font: '400 10.5px/1 var(--font-sans)',
            color: me ? 'rgba(255,255,255,0.55)' : 'var(--ink-4)',
            display: 'block',
            textAlign: 'right',
            marginTop: 5,
          }}
        >
          {time}
        </span>
      </div>
    </div>
  )
}
