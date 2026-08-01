import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function BookingCard({ title, subtitle, emoji, backTo, submitLabel, onSubmit, children }) {
  const { navigate } = useNav();
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in first.');
      navigate('signin');
      return;
    }
    onSubmit();
  };

  return (
    <div className="service-booking-wrap">
      <div className="service-booking-head">
        {backTo && (
          <button className="btn-back-icon" onClick={() => navigate(backTo)}>←</button>
        )}
        <span className="service-emoji">{emoji}</span>
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
