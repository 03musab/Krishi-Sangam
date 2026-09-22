import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import Icon from './Icon';

function extractDistrict(address) {
  if (!address) return '';
  let d =
    address.state_district ||
    address.district ||
    address.county ||
    address.city_district ||
    address.city ||
    '';
  return d.replace(/\s+District$/i, '').trim();
}

function extractState(address) {
  if (!address) return '';
  return (address.state || '').trim();
}

// Reverse geocode with OpenStreetMap's free Nominatim API (no key required).
// Returns location text, district, and state.
async function reverseGeocode(lat, lng) {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}` +
      '&zoom=16&addressdetails=1&accept-language=en';
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return { text: '', district: '', state: '' };
    const data = await res.json();
    if (!data || !data.address) return { text: '', district: '', state: '' };
    const a = data.address;
    const district = extractDistrict(a);
    const state = extractState(a);
    const parts = [
      a.village || a.town || a.city || a.suburb || a.municipality || a.hamlet || a.locality,
      district,
      state
    ].filter(Boolean);
    const text = parts.join(', ') || data.display_name || '';
    return { text, district, state, lat, lng };
  } catch {
    return { text: '', district: '', state: '' };
  }
}

export default function FarmLocationField({ value, onChange, onCoords, onDetails }) {
  const { t } = useLanguage();
  const [coords, setCoords] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [locating, setLocating] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [mapError, setMapError] = useState('');
  const mapContainerRef = useRef(null);

  // Set coordinates AND auto-fill the location text, district & state
  const applyLocation = async (lat, lng) => {
    const next = { lat, lng };
    setCoords(next);
    if (onCoords) onCoords(next);
    setResolving(true);
    const info = await reverseGeocode(lat, lng);
    setResolving(false);
    if (info.text) onChange(info.text, next, info);
    if (onDetails) onDetails(info);
  };

  const handleBlur = async () => {
    if (!value || !value.trim() || !onDetails) return;

    // 1. Check if input is comma-separated e.g. "Dindori, Nashik, Maharashtra"
    const parts = value.split(',').map((s) => s.trim()).filter(Boolean);
    let parsedDistrict = '';
    let parsedState = '';
    if (parts.length >= 3) {
      parsedState = parts[parts.length - 1];
      parsedDistrict = parts[parts.length - 2];
    } else if (parts.length === 2) {
      parsedState = parts[1];
      parsedDistrict = parts[0];
    }

    if (parsedDistrict || parsedState) {
      onDetails({ district: parsedDistrict, state: parsedState });
    }

    // 2. Query Nominatim to resolve district and state if available
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(value.trim())}&addressdetails=1&limit=1&countrycodes=in&accept-language=en`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0 && data[0].address) {
          const a = data[0].address;
          const geoDistrict = extractDistrict(a);
          const geoState = extractState(a);
          if (geoDistrict || geoState) {
            const nextCoords = { lat: Number(data[0].lat), lng: Number(data[0].lon) };
            onDetails({
              district: geoDistrict || parsedDistrict,
              state: geoState || parsedState,
              ...nextCoords
            });
            if (onCoords) {
              setCoords(nextCoords);
              onCoords(nextCoords);
            }
          }
        }
      }
    } catch {
      // ignore network errors
    }
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
      },
      () => {
        setLocating(false);
        setMapError(t('field.geoFail'));
      },
      { timeout: 8000 }
    );
  };

  useEffect(() => {
    if (!showMap || !mapContainerRef.current) return;

    let mapInstance = null;
    let markerInstance = null;

    const initLeaflet = () => {
      if (!window.L || !mapContainerRef.current) return;
      const initialLat = coords?.lat || 19.0760;
      const initialLng = coords?.lng || 73.8777;

      try {
        mapInstance = window.L.map(mapContainerRef.current).setView([initialLat, initialLng], 12);

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors | Mappls Engine'
        }).addTo(mapInstance);

        const pinIcon = window.L.divIcon({
          className: 'custom-map-pin',
          html: '<div style="font-size:32px;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.35));cursor:grab;">📍</div>',
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });

        markerInstance = window.L.marker([initialLat, initialLng], {
          icon: pinIcon,
          draggable: true
        }).addTo(mapInstance);

        markerInstance.on('dragend', () => {
          const pos = markerInstance.getLatLng();
          applyLocation(pos.lat, pos.lng);
        });

        mapInstance.on('click', (e) => {
          const { lat, lng } = e.latlng;
          markerInstance.setLatLng([lat, lng]);
          applyLocation(lat, lng);
        });
      } catch (err) {
        console.error('Leaflet init error:', err);
      }
    };

    if (window.L) {
      initLeaflet();
    } else {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initLeaflet;
        document.head.appendChild(script);
      } else {
        initLeaflet();
      }
    }

    return () => {
      if (mapInstance) {
        try { mapInstance.remove(); } catch (e) {}
      }
    };
  }, [showMap]);

  return (
    <div className="form-group">
      <label className="form-label">{t('field.farmLocation')} *</label>
      <input
        type="text"
        className="form-input"
        placeholder={t('field.villageTaluka')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
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
      </div>
      {mapError && <div className="field-error">{mapError}</div>}
      {coords && !showMap && (
        <div className="coords-chip">
          <Icon name="pushpin" size={13} style={{ verticalAlign: '-2px', marginRight: '5px' }} />
          {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </div>
      )}
      {showMap && (
        <div className="map-embed-wrap">
          <div
            ref={mapContainerRef}
            style={{ width: '100%', height: '320px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #3b82f6' }}
          />
          <div className="map-hint" style={{ marginTop: '8px', fontSize: '0.85rem', color: '#1e40af', fontWeight: '600' }}>
            {coords
              ? `📍 Pin Location: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)} (Click or drag pin to move)`
              : '📍 Click anywhere on the map or drag the pin to set your exact farm location.'}
          </div>
        </div>
      )}
    </div>
  );
}
