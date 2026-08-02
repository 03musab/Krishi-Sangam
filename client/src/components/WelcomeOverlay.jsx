import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';

export default function WelcomeOverlay({ name }) {
  const { t } = useLanguage();

  return createPortal(
    <div className="welcome-overlay" role="status" aria-live="polite">
      <div className="welcome-overlay-card">
        <div className="welcome-check">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M8.5 12.5l2.5 2.5 4.5-4.5" />
          </svg>
        </div>
        <h2 className="welcome-title">{t('common.toast.welcome', { name })}</h2>
        <p className="welcome-sub">{t('common.welcomeSub')}</p>
      </div>
    </div>,
    document.body
  );
}
