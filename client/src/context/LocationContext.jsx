import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { reverseGeocode } from '../lib/geo';

const LocationContext = createContext(null);

const STORAGE_KEY = 'krishi_location';

function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved.lat === 'number' && typeof saved.lng === 'number') {
      return saved;
    }
  } catch { /* ignore */ }
  return null;
}

function persist(lat, lng, place) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng, place }));
  } catch { /* ignore */ }
}

/**
 * Browser geolocation + reverse geocode, shared across the browse sections.
 * status: 'idle' | 'prompting' | 'granted' | 'denied' | 'unsupported'
 */
export function LocationProvider({ children }) {
  const [status, setStatus] = useState('idle');
  const [coords, setCoords] = useState(null);
  const [place, setPlace] = useState(null);

  // Restore a previously granted location without re-prompting.
  useEffect(() => {
    const saved = loadSaved();
    if (saved) {
      setCoords({ lat: saved.lat, lng: saved.lng });
      setPlace(saved.place || null);
      setStatus('granted');
    }
  }, []);

  const requestLocation = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setStatus('unsupported');
      return;
    }
    setStatus('prompting');
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 10 * 60 * 1000
        });
      });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const resolvedPlace = await reverseGeocode(lat, lng);
      setCoords({ lat, lng });
      setPlace(resolvedPlace);
      setStatus('granted');
      persist(lat, lng, resolvedPlace);
    } catch {
      setStatus('denied');
    }
  }, []);

  const clearLocation = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
    setCoords(null);
    setPlace(null);
    setStatus('idle');
  }, []);

  const value = useMemo(
    () => ({ status, coords, place, requestLocation, clearLocation }),
    [status, coords, place, requestLocation, clearLocation]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
