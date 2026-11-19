import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';

export default function FormCard({ title, color, backTo, submitLabel, note, onSubmit, children }) {
  const { navigate, back } = useNav();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const handleBack = () => (backTo ? navigate(backTo) : back());

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
    <>
      <div className={`page-banner ${color}`}>
        <button className="btn-back-icon" onClick={() => navigate(backTo)} aria-label="Back"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg></button>
        <h1 className="page-banner-title">{title}</h1>
      </div>
      <div className="form-card-container">
        <div className="form-card">
          <form className="form-body" onSubmit={handleSubmit}>
            {children}
            <button type="submit" className="btn-form-submit">{submitLabel}</button>
            {note && <div className="form-footer-note">{note}</div>}
          </form>
        </div>
      </div>
    </>
  );
}
