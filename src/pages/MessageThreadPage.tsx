/* Message thread (/messages/:id) — full conversation view. */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Avatar from '@/components/ui/Avatar'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import MessageBubble from '@/components/ui/MessageBubble'
import MessageComposer from '@/components/ui/MessageComposer'
import InfoBox from '@/components/ui/InfoBox'
import NavHeader from '@/components/ui/NavHeader'
import DateSeparator from '@/components/ui/DateSeparator'
import ScrollArea from '@/components/ui/ScrollArea'
import AppShell from '@/layouts/AppShell'

const MESSAGES = [
  { id: '1', me: false, text: 'Hi Igor! Just moved to Berlin and stuck on the Anmeldung appointment — any tips?', time: '14:02' },
  { id: '2', me: true,  text: "Hey! Welcome 🙂 Which district? Mitte slots open ~7am, I'll send you the trick.", time: '14:09' },
  { id: '3', me: false, text: 'Neukölln. That would be amazing, thank you!', time: '14:11' },
  { id: '4', me: true,  text: 'Sure — book via service.berlin.de, refresh at 7:00 sharp. Want me to come translate?', time: '14:15' },
]

export default function MessageThreadPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [draft, setDraft] = useState('')

  return (
    <AppShell
      showTopBar={false}
      showBottomNav={false}
      background="var(--surface-2)"
      footer={
        <MessageComposer
          value={draft}
          onChange={setDraft}
          onSend={() => setDraft('')}
          placeholder={t('messages.writeMessage')}
          attachLabel={t('messages.attach')}
          sendLabel={t('messages.send')}
        />
      }
    >
      <NavHeader
        onBack={() => navigate(-1)}
        backLabel={t('messages.back')}
        leading={<Avatar initials="IP" color="#C7613F" size={36} />}
        title={
          <span className="flex items-center" style={{ gap: 6 }}>
            Igor Petrov
            <Icon name="verified" size={12} style={{ color: 'var(--type-helper)', flexShrink: 0 }} />
          </span>
        }
        subtitle={t('messages.usuallyReplies', { time: '2h' })}
        trailing={<Button variant="ghost" size="sm">{t('messages.profile')}</Button>}
      />

      <InfoBox icon="eye">{t('messages.privacyNote')}</InfoBox>

      <ScrollArea padding="16px 14px">
        <DateSeparator>{t('messages.today')} · {t('messages.threadTopic')}</DateSeparator>
        {MESSAGES.map((b) => (
          <MessageBubble key={b.id} me={b.me} text={b.text} time={b.time} />
        ))}
      </ScrollArea>
    </AppShell>
  )
}
