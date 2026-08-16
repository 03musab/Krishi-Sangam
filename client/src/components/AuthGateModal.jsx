import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useNav } from '../context/NavContext';
import Icon from './Icon';

// Shown to logged-out visitors when they try to view listing details, contact
// an owner, or request a service — browsing stays free, acting requires an account.
export default function AuthGateModal({ title, description, onClose }) {
  const { t } = useLanguage();
  const { navigate } = useNav();
  const closeTimer = useRef(null);

  // Every close path plays the exit animation first, then unmounts.
  const requestClose = () => {
    closeTimer.current = setTimeout(onClose, 180);
  };

  const requestCloseRef = useRef(requestClose);
  requestCloseRef.current = requestClose;

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') requestCloseRef.current(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      clearTimeout(closeTimer.current);
    };
  }, []);

  return createPortal(
    <div className="modal-backdrop" onClick={requestClose} role="dialog" aria-modal="true" aria-label={title || t('gate.title')}>
      <div className="modal-card auth-gate-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={requestClose} aria-label="Close"><Icon name="x" size={16} /></button>
        <div className="auth-gate-body">
          <div className="auth-gate-icon" aria-hidden="true"><Icon name="lock" size={36} /></div>
          <span className="auth-gate-badge"><Icon name="lock" size={13} style={{ verticalAlign: '-2px', marginRight: '6px' }} />{t('gate.membersOnly')}</span>
          <h3 className="auth-gate-title">{title || t('gate.title')}</h3>
          <p className="auth-gate-desc">{description || t('gate.detailsDesc')}</p>
          <div className="auth-gate-actions">
            <button className="members-gate-btn auth-gate-btn" onClick={() => navigate('signup')}>
              {t('auth.createAccount')} →
            </button>
          </div>
          <p className="auth-gate-switch">
            {t('auth.alreadyHave')}{' '}
            <button className="auth-gate-link" onClick={() => navigate('signin')}>
              {t('auth.signinTitle')}
            </button>
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
