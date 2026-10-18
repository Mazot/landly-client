import { useTranslation } from 'react-i18next'
import { Badge, type BadgeProps } from './Badge'
import { STATUS_TONES, type EntityStatus } from './constants/status'
import { UI_NS } from './i18n'

export interface StatusBadgeProps extends Omit<BadgeProps, 'tone' | 'children'> {
  /** `OrganisationStatus` or `PersonStatus` from the API. */
  status: EntityStatus
  /** Overrides the translated default label. */
  label?: string
}

/** Badge with the tone and translated label of a moderation / claim status. */
export function StatusBadge({ status, label, ...rest }: StatusBadgeProps) {
  const { t } = useTranslation(UI_NS)
  return (
    <Badge tone={STATUS_TONES[status]} {...rest}>
      {label ?? t(`status.${status}`)}
    </Badge>
  )
}
