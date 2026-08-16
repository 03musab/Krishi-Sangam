/**
 * Geo helpers — distance math + geocoding via OpenStreetMap Nominatim
 * (free, no API key). Forward-geocode results are cached in localStorage
 * so repeated visits don't re-hit the network.
 */

const GEO_CACHE_KEY = 'krishi_geo_cache';
const NOMINATIM = 'https://nominatim.openstreetmap.org';

function loadCache() {
  try {
    return JSON.parse(localStorage.getItem(GEO_CACHE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveCache(cache) {
  try {
    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cache));
  } catch { /* storage unavailable — ignore */ }
}

/** Great-circle distance between two coordinates, in kilometres. */
export function haversineKm(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

async function nominatim(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('geocoding request failed');
  return res.json();
}

/**
 * Convert the user's coordinates into a human-readable place
 * ({ city, district, state }). Returns null when it can't resolve.
 */
export async function reverseGeocode(lat, lng) {
  try {
    const data = await nominatim(
      `${NOMINATIM}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`
    );
    const a = data.address || {};
    return {
      city: a.city || a.town || a.village || a.municipality || a.county || '',
      district: a.state_district || a.county || a.district || '',
      state: a.state || ''
    };
  } catch {
    return null;
  }
}

/** Normalise a place string for caching + matching. */
export function normalizePlace(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Geocode a place string (e.g. "Sinnar, Nashik") to { lat, lng }.
 * Results are cached in localStorage keyed by the place text.
 */
export async function geocodePlace(place) {
  const key = normalizePlace(place);
  if (!key) return null;

  const cache = loadCache();
  if (key in cache) return cache[key];

  try {
    const data = await nominatim(
      `${NOMINATIM}/search?format=jsonv2&q=${encodeURIComponent(key)}&limit=1&accept-language=en`
    );
    const hit = Array.isArray(data) ? data[0] : null;
    const result = hit ? { lat: parseFloat(hit.lat), lng: parseFloat(hit.lon) } : null;
    cache[key] = result;
    saveCache(cache);
    return result;
  } catch {
    return null;
  }
}

/** True when the listing's location text overlaps the user's place names. */
function textMatches(listing, place) {
  if (!place) return false;
  const haystack = normalizePlace(
    `${listing.location || ''} ${listing.district || ''} ${listing.state || ''}`
  );
  if (!haystack) return false;
  const needles = [place.city, place.district, place.state]
    .filter(Boolean)
    .map(normalizePlace)
    .filter((n) => n.length >= 2);
  return needles.some((n) => haystack.includes(n) || (n.includes(haystack) && haystack.length >= 3));
}

/**
 * Sort listings by distance from the user's location (greatest → nearest
 * handled by geocoding each listing's place string; cached). Listings that
 * can't be geocoded fall back to name matching for the "near you" flag and
 * keep their original order at the end.
 *
 * Each returned listing gains:
 *   _distanceKm — rounded km, or null when unknown
 *   _nearby     — boolean, same city/district or within 40 km
 */
export async function sortListingsByProximity(listings, userLat, userLng, place = null) {
  if (!Array.isArray(listings) || listings.length === 0) return listings;

  const resolved = await Promise.all(
    listings.map(async (listing) => {
      const coord = await geocodePlace(listing.location || listing.district || '');
      const copy = { ...listing };
      if (coord) {
        copy._distanceKm = Math.round(haversineKm(userLat, userLng, coord.lat, coord.lng));
        copy._nearby = copy._distanceKm <= 40;
      } else {
        copy._distanceKm = null;
        copy._nearby = textMatches(listing, place);
      }
      return copy;
    })
  );

  // Near items first (by distance, then name match), then everything else
  // in its original order.
  return resolved.sort((a, b) => {
    const aD = a._distanceKm == null ? Infinity : a._distanceKm;
    const bD = b._distanceKm == null ? Infinity : b._distanceKm;
    if (aD !== bD) return aD - bD;
    if (a._nearby !== b._nearby) return a._nearby ? -1 : 1;
    return 0;
  });
}
