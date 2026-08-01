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
  const { navigate } = useNav();
  return (
    <div className={`page-banner ${BANNER_CLASSES[color] || BANNER_CLASSES.green}`}>
      {backTo && (
        <button className="btn-back-icon" onClick={() => navigate(backTo)}>←</button>
      )}
      <h1 className="page-banner-title">{title}</h1>
      {actionLabel && (
        <button className="banner-action-btn" onClick={onAction}>+ {actionLabel}</button>
      )}
    </div>
  );
}
