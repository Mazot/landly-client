import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { DisplayOrg } from '@/lib/displayOrg'
import Pill from '@/components/ui/Pill'
import Icon from '@/components/ui/Icon'
import { SORTS } from './constants'
import OrgListItem from './OrgListItem'

interface SidebarProps {
  toName: string
  items: DisplayOrg[]
  total: number
  isLoading: boolean
  activeId: string | null
  onSelect: (id: string) => void
}

export default function Sidebar({ toName, items, total, isLoading, activeId, onSelect }: SidebarProps) {
  const { t } = useTranslation()
  const [sort, setSort] = useState<(typeof SORTS)[number]>('nearest')
  const [view, setView] = useState<'list' | 'grid'>('list')

  return (
    <div className="l-scroll" style={{ overflow: 'auto', borderRight: '1px solid var(--border-1)', background: 'var(--bg)' }}>
      <div className="flex justify-between" style={{ padding: '20px 24px 12px 24px', alignItems: 'flex-end' }}>
        <div>
          <div className="l-label" style={{ margin: 0 }}>{t('map.showingIn', { country: toName })}</div>
          <div style={{ font: '600 22px/1.2 var(--font-sans)', marginTop: 6 }}>{t('map.organizationsCount', { count: total })}</div>
        </div>
        <div className="flex" style={{ gap: 4, padding: 3, background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 8 }}>
          {(['list', 'grid'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="flex items-center justify-center"
              style={{
                width: 28, height: 24, border: 0, borderRadius: 5,
                background: view === v ? 'var(--surface)' : 'transparent',
                boxShadow: view === v ? 'var(--shadow-1)' : 'none',
                color: view === v ? 'var(--ink-1)' : 'var(--ink-3)', cursor: 'pointer',
              }}
              aria-label={t(v === 'list' ? 'map.listView' : 'map.gridView')}
            >
              <Icon name={v} size={14} />
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center" style={{ padding: '0 24px 16px 24px', gap: 8 }}>
        <span style={{ font: '500 12.5px/1 var(--font-sans)', color: 'var(--ink-3)' }}>{t('map.sortBy')}</span>
        {SORTS.map((s) => (
          <Pill key={s} active={sort === s} onClick={() => setSort(s)} style={{ height: 26, fontSize: 12, cursor: 'pointer' }}>
            {t(`map.sort.${s}`)}
          </Pill>
        ))}
      </div>
      <div className="flex flex-col" style={{ padding: '0 16px 24px 16px', gap: 8 }}>
        {isLoading && <div style={{ textAlign: 'center', padding: '24px 0', font: '500 13px/1 var(--font-sans)', color: 'var(--ink-3)' }}>{t('map.loading')}</div>}
        {!isLoading && items.length === 0 && <div style={{ textAlign: 'center', padding: '24px 0', font: '500 13px/1 var(--font-sans)', color: 'var(--ink-3)' }}>{t('map.empty')}</div>}
        {items.map((o) => (
          <OrgListItem key={o.id} org={o} active={o.id === activeId} onSelect={() => onSelect(o.id)} />
        ))}
      </div>
    </div>
  )
}
