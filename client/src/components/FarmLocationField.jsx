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
  const [searching, setSearching] = useState(false);
  const [mapSearch, setMapSearch] = useState('');
  const [mapError, setMapError] = useState('');
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

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
      setMapError(t('field.geoError', 'Geolocation is not supported by your browser.'));
      return;
    }
    setLocating(true);
    setMapError('');

    // Request high accuracy GPS first (triangulates WiFi/Cell towers/GPS instead of IP)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        applyLocation(lat, lng);
        setLocating(false);
        setShowMap(true);
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 14);
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          }
        }
      },
      (err) => {
        // Fallback to standard accuracy if high-accuracy timed out
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            applyLocation(lat, lng);
            setLocating(false);
            setShowMap(true);
            if (mapRef.current) {
              mapRef.current.flyTo([lat, lng], 13);
              if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
              }
            }
          },
          () => {
            setLocating(false);
            setMapError('Could not detect exact GPS location. Please search your village or click on the map.');
            setShowMap(true);
          },
          { enableHighAccuracy: false, timeout: 6000 }
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleMapSearch = async () => {
    const query = (mapSearch || value || '').trim();
    if (!query) return;
    setSearching(true);
    setMapError('');
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&addressdetails=1&limit=1&countrycodes=in&accept-language=en`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          applyLocation(lat, lng);
          if (mapRef.current) {
            mapRef.current.flyTo([lat, lng], 14);
            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng]);
            }
          }
          setSearching(false);
          return;
        }
      }
      setMapError(`Location "${query}" not found. Please try adding your district name.`);
    } catch {
      setMapError('Failed to search location. Please check your internet connection.');
    } finally {
      setSearching(false);
    }
  };

  // Synchronize Leaflet map when coords change
  useEffect(() => {
    if (!coords || !mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([coords.lat, coords.lng]);
    } else if (window.L) {
      const pinIcon = window.L.divIcon({
        className: 'custom-map-pin',
        html: '<div style="font-size:34px;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.4));cursor:grab;transform:translate(-50%,-100%);">📍</div>',
        iconSize: [34, 34],
        iconAnchor: [17, 34]
      });
      const marker = window.L.marker([coords.lat, coords.lng], {
        icon: pinIcon,
        draggable: true
      }).addTo(mapRef.current);
      markerRef.current = marker;
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        applyLocation(pos.lat, pos.lng);
      });
    }
  }, [coords]);

  useEffect(() => {
    if (!showMap || !mapContainerRef.current) return;

    const initLeaflet = async () => {
      if (!window.L || !mapContainerRef.current || mapRef.current) return;

      let initialLat = coords?.lat;
      let initialLng = coords?.lng;
      let initialZoom = 13;
      let hasPin = !!(initialLat && initialLng);

      // If no coords but text is typed into the input, center the map on that text
      if (!hasPin && value && value.trim().length > 2) {
        try {
          const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(value.trim())}&limit=1&countrycodes=in&accept-language=en`;
          const res = await fetch(url, { headers: { Accept: 'application/json' } });
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              initialLat = parseFloat(data[0].lat);
              initialLng = parseFloat(data[0].lon);
              initialZoom = 13;
              hasPin = true;
              setCoords({ lat: initialLat, lng: initialLng });
            }
          }
        } catch { /* ignore */ }
      }

      // Check localStorage for saved location
      if (!hasPin) {
        try {
          const saved = JSON.parse(localStorage.getItem('krishi_location')) || JSON.parse(localStorage.getItem('krishisangam_location'));
          if (saved && typeof saved.lat === 'number' && typeof saved.lng === 'number') {
            initialLat = saved.lat;
            initialLng = saved.lng;
            initialZoom = 12;
            hasPin = true;
            setCoords({ lat: initialLat, lng: initialLng });
          }
        } catch { /* ignore */ }
      }

      // Default to general Maharashtra center zoom 7 (overview) instead of arbitrary remote Pune coordinates
      if (!initialLat || !initialLng) {
        initialLat = 19.7515;
        initialLng = 75.7139;
        initialZoom = 7;
        hasPin = false;
      }

      try {
        const map = window.L.map(mapContainerRef.current).setView([initialLat, initialLng], initialZoom);
        mapRef.current = map;

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const pinIcon = window.L.divIcon({
          className: 'custom-map-pin',
          html: '<div style="font-size:34px;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.4));cursor:grab;transform:translate(-50%,-100%);">📍</div>',
          iconSize: [34, 34],
          iconAnchor: [17, 34]
        });

        if (hasPin) {
          const marker = window.L.marker([initialLat, initialLng], {
            icon: pinIcon,
            draggable: true
          }).addTo(map);
          markerRef.current = marker;

          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            applyLocation(pos.lat, pos.lng);
          });
        }

        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            const marker = window.L.marker([lat, lng], {
              icon: pinIcon,
              draggable: true
            }).addTo(map);
            markerRef.current = marker;
            marker.on('dragend', () => {
              const pos = marker.getLatLng();
              applyLocation(pos.lat, pos.lng);
            });
          }
          applyLocation(lat, lng);
        });

        setTimeout(() => {
          if (mapRef.current) mapRef.current.invalidateSize();
        }, 200);
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
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (e) {}
        mapRef.current = null;
        markerRef.current = null;
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
        <div className="map-embed-wrap" style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.88rem' }}
              placeholder="🔍 Search village, taluka, or city to move pin..."
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleMapSearch();
                }
              }}
            />
            <button
              type="button"
              className="locate-btn"
              style={{ whiteSpace: 'nowrap', padding: '8px 14px', fontSize: '0.85rem' }}
              onClick={handleMapSearch}
              disabled={searching}
            >
              {searching ? t('field.locating', 'Searching...') : 'Search'}
            </button>
          </div>
          <div
            ref={mapContainerRef}
            style={{ width: '100%', height: '340px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #3b82f6' }}
          />
          <div className="map-hint" style={{ marginTop: '8px', fontSize: '0.85rem', color: '#1e40af', fontWeight: '600' }}>
            {coords
              ? `📍 Pin Location: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)} (Click map or drag pin to adjust)`
              : '📍 Search your village above, or click anywhere on the map to drop your farm pin.'}
          </div>
        </div>
      )}
    </div>
  );
}
