/* ═══════════════════════════════════════════
   Krishi Sangam — server/lib/geo.js
   Geolocation, Haversine Distance & Strict 25 km Radius Filtering Engine
   ═══════════════════════════════════════════ */

const DISTRICT_COORDS = {
  'nashik': { lat: 19.9975, lng: 73.7898 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'latur': { lat: 18.4088, lng: 76.5604 },
  'kolhapur': { lat: 16.7050, lng: 74.2433 },
  'nanded': { lat: 19.1383, lng: 77.3210 },
  'beed': { lat: 18.9891, lng: 75.7601 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'amravati': { lat: 20.9374, lng: 77.7796 },
  'chhatrapati sambhajinagar': { lat: 19.8762, lng: 75.3433 },
  'aurangabad': { lat: 19.8762, lng: 75.3433 },
  'ahmednagar': { lat: 19.0948, lng: 74.7480 },
  'satara': { lat: 17.6805, lng: 74.0183 },
  'solapur': { lat: 17.6599, lng: 75.9064 },
  'sangli': { lat: 16.8524, lng: 74.5815 },
  'jalgaon': { lat: 21.0077, lng: 75.5626 },
  'dhule': { lat: 20.9042, lng: 74.7749 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'thane': { lat: 19.2183, lng: 72.9781 },
  'raigad': { lat: 18.6414, lng: 72.8722 },
  'ratnagiri': { lat: 16.9902, lng: 73.3120 },
  'sindhudurg': { lat: 16.1649, lng: 73.7124 },
  'wardha': { lat: 20.7453, lng: 78.6022 },
  'yavatmal': { lat: 20.3888, lng: 78.1204 },
  'akola': { lat: 20.7002, lng: 77.0082 },
  'buldhana': { lat: 20.5294, lng: 76.1843 },
  'washim': { lat: 20.1105, lng: 77.1352 },
  'gondia': { lat: 21.4624, lng: 80.1961 },
  'bhandara': { lat: 21.1719, lng: 79.6542 },
  'gadchiroli': { lat: 20.1849, lng: 80.0024 },
  'chandrapur': { lat: 19.9615, lng: 79.2961 },
  'dharashiv': { lat: 18.1861, lng: 76.0413 },
  'osmanabad': { lat: 18.1861, lng: 76.0413 },
  'hingoli': { lat: 19.7173, lng: 77.1473 },
  'palghar': { lat: 19.6966, lng: 72.7699 },
  'parbhani': { lat: 19.2608, lng: 76.7746 }
};

function getHaversineDistance(lat1, lng1, lat2, lng2) {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return null;
  const numLat1 = Number(lat1);
  const numLng1 = Number(lng1);
  const numLat2 = Number(lat2);
  const numLng2 = Number(lng2);
  if (isNaN(numLat1) || isNaN(numLng1) || isNaN(numLat2) || isNaN(numLng2)) return null;

  const R = 6371; // Earth radius in km
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(numLat2 - numLat1);
  const dLng = toRad(numLng2 - numLng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(numLat1)) * Math.cos(toRad(numLat2)) *
    Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function resolveCoords(obj) {
  if (!obj) return { lat: null, lng: null };

  const rawLat = obj.lat ?? obj.farm_lat ?? obj.latitude;
  const rawLng = obj.lng ?? obj.farm_lng ?? obj.longitude;

  if (rawLat != null && rawLng != null && !isNaN(Number(rawLat)) && !isNaN(Number(rawLng))) {
    return { lat: Number(rawLat), lng: Number(rawLng) };
  }

  // Fallback to text matching location or district
  const textStr = [obj.district, obj.location, obj.address, obj.farm_location, obj.state]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  for (const [key, coords] of Object.entries(DISTRICT_COORDS)) {
    if (textStr.includes(key)) {
      return coords;
    }
  }

  return { lat: null, lng: null };
}

function isWithinRadius(userLoc, providerLoc, maxKm = 25) {
  const c1 = resolveCoords(userLoc);
  const c2 = resolveCoords(providerLoc);

  const dist = getHaversineDistance(c1.lat, c1.lng, c2.lat, c2.lng);
  if (dist != null) {
    return { isWithin: dist <= maxKm, distKm: Math.round(dist * 10) / 10 };
  }

  // If coordinates couldn't be resolved, check if districts match
  const d1 = (userLoc?.district || userLoc?.location || '').toLowerCase().trim();
  const d2 = (providerLoc?.district || providerLoc?.location || '').toLowerCase().trim();

  if (d1 && d2) {
    // If different districts are explicitly specified, treat as > 25km
    const sameDistrict = d1.includes(d2) || d2.includes(d1);
    if (!sameDistrict) {
      return { isWithin: false, distKm: null };
    }
    // Same district: estimate 12 km
    return { isWithin: true, distKm: 12.0 };
  }

  // Default: if location is same string or unspecified, keep within radius
  return { isWithin: true, distKm: 5.0 };
}

module.exports = {
  DISTRICT_COORDS,
  getHaversineDistance,
  resolveCoords,
  isWithinRadius
};
