import { useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { Topbar } from '../components/Topbar'
import { supportedLanguages } from '../lib/i18n'
import { useI18n } from '../lib/useI18n'
import type { AuthUser } from '../lib/authApi'
import type { AppDestination } from '../types/ui'

type SettingsPageProps = {
  user: AuthUser
  onNavigate?: (page: AppDestination) => void
  onLogout?: () => void | Promise<void>
}

export function SettingsPage({
  user,
  onNavigate,
  onLogout,
}: SettingsPageProps) {
  const { language, setLanguage, t } = useI18n()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const currentLanguage = useMemo(
    () =>
      supportedLanguages.find((item) => item.code === language) ??
      supportedLanguages[0],
    [language],
  )

  async function handleLogout() {
    if (!onLogout) {
      return
    }

    setIsLoggingOut(true)
    await onLogout()
  }

  return (
    <div className="app-shell">
      <Topbar onNavigate={onNavigate} onLogout={onLogout} />

      <main className="settings-page">
        <div className="fridge-header">
          <div>
            <p className="eyebrow">{t('settings.eyebrow')}</p>
            <h1>{t('settings.title')}</h1>
            <p className="settings-lead">{t('settings.subtitle')}</p>
          </div>
          <button
            type="button"
            className="secondary-button back-home-button"
            onClick={() => onNavigate?.('home')}
          >
            <div style={{ transform: 'scaleX(-1)', display: 'inline-flex' }}>
              <Icon name="arrow" />
            </div>
            <span>{t('common.backHome')}</span>
          </button>
        </div>

        <section className="settings-grid" aria-label={t('settings.title')}>
          <article className="panel settings-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{t('settings.signedIn')}</p>
                <h2>{t('settings.accountTitle')}</h2>
              </div>
            </div>
            <p className="settings-section__description">
              {t('settings.accountDescription')}
            </p>
            <dl className="settings-list">
              <div>
                <dt>{t('settings.email')}</dt>
                <dd>{user.email ?? '-'}</dd>
              </div>
              <div>
                <dt>{t('settings.userId')}</dt>
                <dd className="settings-mono">{user.id}</dd>
              </div>
              <div>
                <dt>{t('settings.authStatus')}</dt>
                <dd>
                  <span className="status-pill">{t('settings.signedIn')}</span>
                </dd>
              </div>
            </dl>
          </article>

          <article className="panel settings-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{t('settings.currentLanguage')}</p>
                <h2>{t('settings.languageTitle')}</h2>
              </div>
            </div>
            <p className="settings-section__description">
              {t('settings.languageDescription')}
            </p>
            <div className="language-options" role="radiogroup">
              {supportedLanguages.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  className={`language-option ${
                    language === item.code ? 'is-active' : ''
                  }`}
                  role="radio"
                  aria-checked={language === item.code}
                  onClick={() => setLanguage(item.code)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.nativeName}</span>
                </button>
              ))}
            </div>
            <p className="settings-note">
              {t('settings.currentLanguage')}: {currentLanguage.label}
            </p>
          </article>

          <article className="panel settings-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{t('common.comingSoon')}</p>
                <h2>{t('settings.preferencesTitle')}</h2>
              </div>
            </div>
            <p className="settings-section__description">
              {t('settings.preferencesDescription')}
            </p>
            <ul className="settings-plan-list">
              <li>
                <strong>{t('settings.defaultServings')}</strong>
                <span>{t('settings.defaultServingsDescription')}</span>
              </li>
              <li>
                <strong>{t('settings.dietary')}</strong>
                <span>{t('settings.dietaryDescription')}</span>
              </li>
              <li>
                <strong>{t('settings.notifications')}</strong>
                <span>{t('settings.notificationsDescription')}</span>
              </li>
            </ul>
          </article>

          <article className="panel settings-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{t('common.logout')}</p>
                <h2>{t('settings.dataSecurityTitle')}</h2>
              </div>
            </div>
            <p className="settings-section__description">
              {t('settings.dataSecurityDescription')}
            </p>
            <div className="settings-session-row">
              <div>
                <strong>{t('settings.logoutTitle')}</strong>
                <span>{t('settings.logoutDescription')}</span>
              </div>
              <button
                type="button"
                className="secondary-button danger-button"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut
                  ? t('settings.loggingOut')
                  : t('settings.logoutButton')}
              </button>
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}
