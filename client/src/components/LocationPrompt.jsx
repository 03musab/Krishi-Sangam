import { useLocation } from '../context/LocationContext';
import { useLanguage } from '../i18n/LanguageContext';
import Icon from './Icon';

/**
 * Compact location prompt shown in each browse section. A small single-line
 * box asking the user to allow location access; once granted, it reports the
 * place listings are being sorted around. Degrades gracefully on denial /
 * unsupported devices.
 */
export default function LocationPrompt() {
  const { status, place, requestLocation } = useLocation();
  const { t } = useLanguage();

  if (status === 'granted') {
    const label =
      place?.city ||
      (place && [place.district, place.state].filter(Boolean).join(', ')) ||
      '';
    return (
      <div className="location-prompt granted">
        <span className="location-prompt-icon"><Icon name="pin" size={14} /></span>
        <span className="location-prompt-text">
          {label ? t('loc.showingNear', { place: label }) : t('loc.showingNearAll')}
        </span>
      </div>
    );
  }

  if (status === 'prompting') {
    return (
      <div className="location-prompt">
        <span className="btn-spinner btn-spinner-sm location-prompt-spinner" aria-hidden="true" />
        <span className="location-prompt-text">{t('loc.accessing')}</span>
      </div>
    );
  }

  const denied = status === 'denied';
  const unsupported = status === 'unsupported';

  return (
    <div className="location-prompt">
      <span className="location-prompt-icon"><Icon name="pin" size={14} /></span>
      <span className="location-prompt-text">
        {unsupported ? t('loc.unsupported') : denied ? t('loc.denied') : t('loc.allowTitle')}
      </span>
      {!unsupported && (
        <button className="location-prompt-btn" onClick={requestLocation}>
          {denied ? t('loc.retry') : t('loc.enable')}
        </button>
      )}
    </div>
  );
}
