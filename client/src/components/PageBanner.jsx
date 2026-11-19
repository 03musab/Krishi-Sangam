import { useNav } from '../context/NavContext';

const BANNER_CLASSES = {
  green: 'banner-green',
  orange: 'banner-orange',
  purple: 'banner-purple',
  amber: 'banner-amber',
  blue: 'banner-blue',
  teal: 'banner-teal',
  emerald: 'banner-emerald',
  slate: 'banner-slate'
};

export default function PageBanner({ title, color = 'green', actionLabel, onAction, backTo }) {
  const { navigate, back } = useNav();
  const handleBack = () => (backTo ? navigate(backTo) : back());
  return (
    <div className={`page-banner ${BANNER_CLASSES[color] || BANNER_CLASSES.green}`}>
      <button className="btn-back-icon" onClick={handleBack} aria-label="Back"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg></button>
      <h1 className="page-banner-title">{title}</h1>
      {actionLabel && (
        <button className="banner-action-btn" onClick={onAction}>+ {actionLabel}</button>
      )}
    </div>
  );
}
