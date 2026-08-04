import { useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import Icon from './Icon';

// Default map view (centered on Maharashtra) shown before the user picks anything
const DEFAULT_VIEW = { west: 73.75, south: 18.45, east: 74.05, north: 18.65 };
const MAP_SPAN = 0.02; // degrees shown around the marker once a point is set

// Reverse geocode with OpenStreetMap's free Nominatim API (no key required).
// Returns a short "Village, Taluka, State" style address, or '' on failure.
async function reverseGeocode(lat, lng) {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}` +
      '&zoom=16&addressdetails=1&accept-language=en';
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return '';
    const data = await res.json();
    if (!data || !data.address) return '';
    const a = data.address;
    const parts = [
      a.village || a.town || a.city || a.suburb || a.municipality || a.hamlet || a.locality,
      a.district || a.county || a.municipality,
      a.state
    ].filter(Boolean);
    return parts.join(', ') || data.display_name || '';
  } catch {
    return '';
  }
}

export default function FarmLocationField({ value, onChange, onCoords }) {
  const { t } = useLanguage();
  const [coords, setCoords] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [locating, setLocating] = useState(false);
  const [picking, setPicking] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [mapError, setMapError] = useState('');
  const mapWrapRef = useRef(null);

  // Set coordinates AND auto-fill the location text from the map — no typing needed.
  const applyLocation = async (lat, lng) => {
    const next = { lat, lng };
    setCoords(next);
    if (onCoords) onCoords(next);
    setResolving(true);
    const place = await reverseGeocode(lat, lng);
    setResolving(false);
    if (place) onChange(place); // leave whatever was typed if geocoding fails
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
        applyLocation(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
        setShowMap(true);
        setPicking(false);
      },
      () => {
        setLocating(false);
        setMapError(t('field.geoFail'));
      },
      { timeout: 8000 }
    );
  };

  // Convert a click on the map container to lat/lng using the known bbox the
  // embed is showing (accounts for the iframe's aspect ratio), then geocode it.
  const handleMapPick = (e) => {
    const el = mapWrapRef.current;
    if (!el || !picking) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const west = coords ? coords.lng - MAP_SPAN : DEFAULT_VIEW.west;
    const south = coords ? coords.lat - MAP_SPAN : DEFAULT_VIEW.south;
    const east = coords ? coords.lng + MAP_SPAN : DEFAULT_VIEW.east;
    const north = coords ? coords.lat + MAP_SPAN : DEFAULT_VIEW.north;
    const lngSpan = east - west;
    const latSpan = north - south;

    // The embed fits the bbox inside the iframe (contain-style): the dimension
    // with the smaller degree-per-pixel ratio gets extended to fill the box.
    let dispLng, dispLat;
    if (rect.width / rect.height >= lngSpan / latSpan) {
      dispLat = latSpan;
      dispLng = latSpan * (rect.width / rect.height);
    } else {
      dispLng = lngSpan;
      dispLat = lngSpan * (rect.height / rect.width);
    }

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const lng = west + (x / rect.width) * dispLng;
    const lat = north - (y / rect.height) * dispLat;

    setPicking(false);
    applyLocation(lat, lng);
  };

  const mapSrc = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - MAP_SPAN}%2C${coords.lat - MAP_SPAN}%2C${coords.lng + MAP_SPAN}%2C${coords.lat + MAP_SPAN}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=${DEFAULT_VIEW.west}%2C${DEFAULT_VIEW.south}%2C${DEFAULT_VIEW.east}%2C${DEFAULT_VIEW.north}&layer=mapnik&marker=18.55%2C73.90`;

  return (
    <div className="form-group">
      <label className="form-label">{t('field.farmLocation')} *</label>
      <input
        type="text"
        className="form-input"
        placeholder={t('field.villageTaluka')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={resolving}
        required
      />
      {resolving && (
        <div className="username-status checking">
          <span className="btn-spinner btn-spinner-dark btn-spinner-sm" aria-hidden="true" />
          {t('field.resolving')}
        </div>
      )}
      <div className="location-actions">
        <button type="button" className="locate-btn" onClick={handleLocate} disabled={locating || resolving}>
          <Icon name="pin" size={15} style={{ verticalAlign: '-2px', marginRight: '6px' }} />
          {locating ? t('field.locating') : t('field.useMyLocation')}
        </button>
        <button type="button" className="locate-btn secondary" onClick={() => setShowMap((s) => !s)}>
          <Icon name="map" size={15} style={{ verticalAlign: '-2px', marginRight: '6px' }} />
          {showMap ? t('field.hideMap') : t('field.showMap')}
        </button>
        {showMap && (
          <button
            type="button"
            className={`locate-btn ${picking ? 'active' : ''}`}
            onClick={() => setPicking((p) => !p)}
          >
            <Icon name="pushpin" size={15} style={{ verticalAlign: '-2px', marginRight: '6px' }} />
            {picking ? t('field.cancelPick') : t('field.pickOnMap')}
          </button>
        )}
      </div>
      {mapError && <div className="field-error">{mapError}</div>}
      {coords && !showMap && (
        <div className="coords-chip">
          <Icon name="pushpin" size={13} style={{ verticalAlign: '-2px', marginRight: '5px' }} />
          {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </div>
      )}
      {showMap && (
        <div className="map-embed-wrap" ref={mapWrapRef}>
          <iframe
            title="Farm Location Map"
            className="map-embed"
            src={mapSrc}
            loading="lazy"
          />
          {picking && (
            <div className="map-pick-overlay" onClick={handleMapPick}>
              <div className="map-pick-crosshair">
                <span className="map-pick-crosshair-v" />
                <span className="map-pick-crosshair-h" />
                <span className="map-pick-dot" />
              </div>
              <span className="map-pick-hint">{t('field.pickHint')}</span>
            </div>
          )}
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
