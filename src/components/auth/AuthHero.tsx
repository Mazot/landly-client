import { Trans, useTranslation } from 'react-i18next'
import { Accent, PageHeader } from '@/components/ui'

/** Hero copy beside the sign-in / sign-up form (large screens). */
export function AuthHero() {
  const { t } = useTranslation()
  return <PageHeader as="h2" size="xl" title={<Trans i18nKey="auth.hero.title" components={{ accent: <Accent>x</Accent> }} />} lede={t('auth.hero.lede')} />
}
