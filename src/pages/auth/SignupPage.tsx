/* Sign up (/signup) — one-screen: account + optional personalization. */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSignup } from '@/hooks/useAuth'
import { useToggleSet } from '@/hooks/useToggleSet'
import Icon from '@/components/ui/Icon'
import Chip from '@/components/ui/Chip'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import TextField from '@/components/ui/TextField'
import Divider from '@/components/ui/Divider'
import DividerWithText from '@/components/ui/DividerWithText'
import CorridorPicker from '@/components/ui/CorridorPicker'
import AuthSplitLayout from '@/components/ui/AuthSplitLayout'

const ROLES = ['newcomer', 'helping', 'exploring']
const LANGS = ['russian', 'english', 'addMore']

export default function SignupPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const signup = useSignup()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('newcomer')
  const { has: hasLang, toggle: toggleLang } = useToggleSet<string>(['russian', 'english'])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signup.mutateAsync({ username: name || email.split('@')[0], email, password })
      navigate('/welcome')
    } catch (err) {
      console.error('Signup failed:', err)
    }
  }

  const handleGoogle = () => {
    window.location.href = '/api/user/oauth/google/login'
  }

  return (
    <AuthSplitLayout
      eyebrow={t('signupOne.eyebrow')}
      title={<>{t('signupOne.heroLine1')}<br /><em>{t('signupOne.heroLine2')}</em></>}
      subtitle={t('signupOne.subtitle')}
    >
      {/* right form — px-4 mobile, px-16 tablet+ */}
      <form className="l-scroll flex flex-col px-4 pt-6 pb-10 md:px-16 md:pt-11" onSubmit={handleSubmit} style={{ overflowY: 'auto', height: '100%' }}>
        <div>
        <div className="flex justify-between items-center" style={{ marginBottom: 26 }}>
          <h3 style={{ font: '600 22px/1 var(--font-sans)', margin: 0 }}>{t('signupOne.createTitle')}</h3>
          <span className="hidden md:inline" style={{ font: '500 13px/1 var(--font-sans)', color: 'var(--ink-3)' }}>
            {t('signupOne.haveOne')}{' '}
            <Link to="/login" style={{ color: 'var(--ink-1)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>{t('signupOne.signIn')}</Link>
          </span>
        </div>
        {/* Login link — mobile only (below heading) */}
        <div className="md:hidden" style={{ marginTop: -18, marginBottom: 20, font: '500 13px/1 var(--font-sans)', color: 'var(--ink-3)' }}>
          {t('signupOne.haveOne')}{' '}
          <Link to="/login" style={{ color: 'var(--ink-1)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>{t('signupOne.signIn')}</Link>
        </div>

        <div className="flex flex-col lg:flex-row" style={{ gap: 10 }}>
          <Button type="button" variant="ghost" fullWidth style={{ height: 48, justifyContent: 'center', gap: 10 }} onClick={handleGoogle}>
            <Icon name="google" size={18} stroke={0} /> {t('ui.continueGoogle')}
          </Button>
          <Button type="button" variant="ghost" fullWidth style={{ height: 48, justifyContent: 'center', gap: 10 }}>
            {t('ui.continueApple')}
          </Button>
        </div>
        <DividerWithText style={{ margin: '20px 0' }}>{t('ui.orWithEmail')}</DividerWithText>

        {/* name + email: stacked on mobile, side-by-side on tablet+ */}
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14 }}>
          <TextField label={t('signupOne.name')} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('signupOne.namePlaceholder')} />
          <TextField label={t('signupOne.email')} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('signupOne.emailPlaceholder')} />
        </div>
        <div style={{ marginTop: 14 }}>
          <TextField label={t('signupOne.password')} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        <Divider style={{ margin: '24px 0 18px 0' }} />

        <div className="flex items-center" style={{ gap: 8, marginBottom: 14 }}>
          <span className="l-label" style={{ margin: 0 }}>{t('signupOne.personalize')}</span>
          <Badge>{t('ui.optional')}</Badge>
          <button type="button" onClick={() => navigate('/welcome')} style={{ marginLeft: 'auto', font: '600 12.5px/1 var(--font-sans)', color: 'var(--ink-2)', textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer', background: 'transparent', border: 0 }}>
            {t('signupOne.skipSetup')}
          </button>
        </div>

        <div className="l-label" style={{ marginBottom: 10 }}>{t('signupOne.yourCorridor')}</div>
        <CorridorPicker />
        <div className="flex items-center" style={{ marginTop: 10, gap: 7, font: '500 12px/1.45 var(--font-sans)', color: 'var(--ink-3)' }}>
          <Icon name="sparkle" size={13} style={{ color: 'var(--accent)' }} /> {t('signupOne.noRush')}
        </div>

        {/* role + lang: stacked on mobile, side-by-side on tablet+ */}
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ marginTop: 20, gap: 24 }}>
          <div>
            <div className="l-label" style={{ marginBottom: 10 }}>{t('signupOne.hereAs')}</div>
            <div className="flex flex-wrap" style={{ gap: 7 }}>
              {ROLES.map((r) => (
                <Chip key={r} active={role === r} onClick={() => setRole(r)}>
                  {t(`signupOne.roles.${r}`)}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <div className="l-label" style={{ marginBottom: 10 }}>{t('signupOne.languages')}</div>
            <div className="flex flex-wrap" style={{ gap: 7 }}>
              {LANGS.map((l) => (
                <Chip key={l} active={hasLang(l)} onClick={() => toggleLang(l)}>
                  {l === 'addMore' ? t('signupOne.langs.addMore') : t(`signupOne.langs.${l}`)}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        {signup.error && (
          <div style={{ marginTop: 16, font: '500 13px/1.4 var(--font-sans)', color: 'var(--danger)' }}>
            {(signup.error as Error).message}
          </div>
        )}

        <Button type="submit" variant="accent" size="lg" fullWidth style={{ marginTop: 28 }} disabled={signup.isPending}>
          {signup.isPending ? t('signupOne.creating') : t('signupOne.createAccount')} <Icon name="arrowRight" size={15} stroke={2} />
        </Button>
        <p style={{ font: '500 12px/1.5 var(--font-sans)', color: 'var(--ink-3)', textAlign: 'center', marginTop: 14 }}>
          {t('signupOne.terms')}
        </p>
        </div>
      </form>
    </AuthSplitLayout>
  )
}
