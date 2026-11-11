import { useTranslation } from 'react-i18next'
import { Icon } from './DS/Icon'
import { UI_NS } from './i18n'

/** Blue check after a place's name — set only by moderators in the database. */
export function VerifiedMark({ size = 13 }: { size?: number }) {
  const { t } = useTranslation(UI_NS)
  return <Icon name="verified" size={size} label={t('verified')} className="text-type-embassy" />
}
