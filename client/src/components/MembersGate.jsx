import { useNav } from '../context/NavContext';
import { useLanguage } from '../i18n/LanguageContext';
import PageBanner from './PageBanner';
import Icon from './Icon';

export default function MembersGate({ title, description, icon, color }) {
  const { navigate } = useNav();
  const { t } = useLanguage();

  return (
    <>
      <PageBanner title={title} color={color} />
      <div className="members-gate">
        <div className="members-gate-card">
          <div className="members-gate-icon" aria-hidden="true"><Icon name={icon} size={44} /></div>
          <span className="members-gate-badge"><Icon name="lock" size={13} style={{ verticalAlign: '-2px', marginRight: '6px' }} />{t('gate.membersOnly')}</span>
          <h2 className="members-gate-title">{title}</h2>
          <p className="members-gate-desc">{description}</p>
          <button
            className="members-gate-btn"
            onClick={() => navigate('signup')}
          >
            {t('nav.signup')} →
          </button>
          <p className="members-gate-switch">
            {t('auth.alreadyHave')}{' '}
            <button className="members-gate-link" onClick={() => navigate('signin')}>
              {t('auth.signinTitle')}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
