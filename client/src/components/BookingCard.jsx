import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import Icon from './Icon';

export default function BookingCard({ title, subtitle, icon, backTo, onBack, submitLabel, onSubmit, children }) {
  const { navigate, back } = useNav();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  // onBack overrides backTo — used by pages where the booking form is an
  // internal flow on the same view (e.g. Labour), where navigate() would be
  // a no-op and the flow would never reset.
  const handleBack = () => (onBack ? onBack() : backTo ? navigate(backTo) : back());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      showToast(t('common.pleaseSignin'));
      navigate('signin');
      return;
    }
    onSubmit();
  };

  return (
    <div className="service-booking-wrap">
      <div className="service-booking-head">
        <button className="btn-back-icon" onClick={handleBack} aria-label="Back">←</button>
        <span className="service-emoji"><Icon name={icon} size={40} /></span>
        <div>
          <h1 className="service-booking-title">{title}</h1>
          {subtitle && <p className="service-booking-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="service-booking-card">
        <form className="form-body" onSubmit={handleSubmit}>
          {children}
          <button type="submit" className="btn-form-submit">{submitLabel}</button>
        </form>
      </div>
    </div>
  );
}
