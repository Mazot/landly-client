/* Messaging inbox (/messages) — conversation list. */
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import ConversationRow from '@/components/ui/ConversationRow'
import PageHeader from '@/components/ui/PageHeader'
import ScrollArea from '@/components/ui/ScrollArea'
import AppShell from '@/layouts/AppShell'

const CONVOS = [
  { id: '1', initials: 'IP', color: '#C7613F', name: 'Igor Petrov', last: 'Sure — book the Bürgeramt slot via…', when: 'now', helper: true, active: true },
  { id: '2', initials: 'RH', color: '#8B5A8C', name: 'Russian House Berlin', last: 'Film night is Friday at 19:00', when: '2h', helper: false, active: false },
  { id: '3', initials: 'OL', color: '#4F7F5C', name: 'Olga (Newcomers)', last: 'Happy to help with the bank account', when: '1d', helper: true, active: false },
  { id: '4', initials: 'BB', color: '#B8814A', name: 'Babushka Bakery', last: 'Yes, we have medovik to order', when: '3d', helper: false, active: false },
]

export default function MessagesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <AppShell showTopBar={false} showBottomNav>
      <PageHeader
        title={t('messages.title')}
        trailing={
          <Button iconButton variant="ghost" size="sm" aria-label={t('messages.newMessage')}>
            <Icon name="edit" size={15} />
          </Button>
        }
      />
      <ScrollArea padding="10px 14px">
        {CONVOS.map((c) => (
          <ConversationRow
            key={c.id}
            initials={c.initials}
            color={c.color}
            name={c.name}
            isHelper={c.helper}
            lastMessage={c.last}
            time={c.when}
            active={c.active}
            onClick={() => navigate(`/messages/${c.id}`)}
          />
        ))}
      </ScrollArea>
    </AppShell>
  )
}
