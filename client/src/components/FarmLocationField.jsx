import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export default function FarmLocationField({ value, onChange, onCoords }) {
  const { t } = useLanguage();
  const [coords, setCoords] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapError, setMapError] = useState('');

  const updateCoords = (lat, lng) => {
    const next = { lat, lng };
    setCoords(next);
    if (onCoords) onCoords(next);
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setMapError(t('field.geoError'));
      return;
    }
    setLocating(true);
    setMapError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateCoords(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
        setShowMap(true);
      },
      () => {
        setLocating(false);
        setMapError(t('field.geoFail'));
      },
      { timeout: 8000 }
    );
  };

  const mapSrc = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.02}%2C${coords.lat - 0.02}%2C${coords.lng + 0.02}%2C${coords.lat + 0.02}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`
    : 'https://www.openstreetmap.org/export/embed.html?bbox=73.75%2C18.45%2C74.05%2C18.65&layer=mapnik&marker=18.55%2C73.90';

  return (
    <div className="form-group">
      <label className="form-label">{t('field.farmLocation')} *</label>
      <input
        type="text"
        className="form-input"
        placeholder={t('field.villageTaluka')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
      <div className="location-actions">
        <button type="button" className="locate-btn" onClick={handleLocate} disabled={locating}>
          📍 {locating ? t('field.locating') : t('field.useMyLocation')}
        </button>
        <button type="button" className="locate-btn secondary" onClick={() => setShowMap((s) => !s)}>
          🗺️ {showMap ? t('field.hideMap') : t('field.showMap')}
        </button>
      </div>
      {mapError && <div className="field-error">{mapError}</div>}
      {coords && !showMap && (
        <div className="coords-chip">
          📌 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </div>
      )}
      {showMap && (
        <div className="map-embed-wrap">
          <iframe
            title="Farm Location Map"
            className="map-embed"
            src={mapSrc}
            loading="lazy"
          />
          <div className="map-hint">
            {coords
              ? t('field.selectedPoint', { lat: coords.lat.toFixed(5), lng: coords.lng.toFixed(5) })
              : t('field.mapHint')}
          </div>
        </div>
      )}
    </div>
  );
}
