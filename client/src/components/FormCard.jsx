import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';

export default function FormCard({ title, color, backTo, submitLabel, note, onSubmit, children }) {
  const { navigate } = useNav();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

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
        <button className="btn-back-icon" onClick={() => navigate(backTo)}>←</button>
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
