import { compact } from 'es-toolkit'
import { useTranslation } from 'react-i18next'
import { Avatar, Icon, ListItem, Rating, VerifiedMark } from '@/components/ui'
import { personPath } from '@/lib/routes'
import type { Person } from '@/types/api'

export interface PersonRowProps {
  person: Person
  /** Tighter row for tablet and phone. */
  compact: boolean
}

/** One helper in the list: avatar, name (a check once they linked their account), city · skills, vouches and rating — opens the profile. */
export function PersonRow({ person, compact: dense }: PersonRowProps) {
  const { t } = useTranslation()
  return (
    <ListItem
      variant="card"
      size={dense ? 'sm' : 'md'}
      to={personPath(person.id)}
      leading={<Avatar name={person.name} size={dense ? 'md' : 'lg'} />}
      title={person.name}
      adornment={person.status === 'claimed' ? <VerifiedMark /> : undefined}
      subtitle={compact([person.city, person.skills.join(', ')]).join(' · ')}
      meta={
        <>
          <span className="inline-flex items-center gap-1 text-xs leading-none font-semibold text-ink-2">
            <Icon name="heart" size={12} />
            {t('people.vouches', { count: person.vouches })}
          </span>
          {person.allowReviews ? <Rating value={person.ratingAvg} count={person.reviewsCount} size="sm" /> : <span className="text-xs font-medium text-ink-4">{t('people.reviewsOff')}</span>}
        </>
      }
      trailing={<Icon name="chevronRight" size={16} className="text-ink-4" />}
    />
  )
}
