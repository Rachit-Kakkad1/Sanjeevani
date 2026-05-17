/**
 * Mappls (MapmyIndia) Service
 *
 * Search strategy (in order):
 *  1. Mappls REST API via Vite proxy (nearby + textsearch)
 *  2. Existing backend store API fallback (/api/v1/stores/nearby)
 *
 * NO direct cross-origin calls — all proxied through Vite dev server.
 */

const MAPPLS_KEY = import.meta.env.VITE_MAPPLS_API_KEY;
const MAPPLS_CLIENT_ID = import.meta.env.VITE_MAPPLS_CLIENT_ID || '';
const MAPPLS_CLIENT_SECRET = import.meta.env.VITE_MAPPLS_CLIENT_SECRET || '';

// ─── SDK Loading ───────────────────────────────────────────────

let mapSdkPromise = null;

/**
 * Load the main Mappls Map SDK (only once).
 */
export function loadMapplsMapSDK() {
  if (mapSdkPromise) return mapSdkPromise;

  if (window.mappls && window.mappls.Map) {
    mapSdkPromise = Promise.resolve(window.mappls);
    return mapSdkPromise;
  }

  mapSdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="map_sdk?"]');
    if (existing) {
      waitFor(() => window.mappls && window.mappls.Map, 30)
        .then(() => resolve(window.mappls))
        .catch(reject);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://apis.mappls.com/advancedmaps/api/${MAPPLS_KEY}/map_sdk?v=3.0&libraries=direction,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      waitFor(() => window.mappls && window.mappls.Map, 30)
        .then(() => resolve(window.mappls))
        .catch(reject);
    };
    script.onerror = () => reject(new Error('Failed to load Mappls Map SDK'));
    document.head.appendChild(script);
  });

  return mapSdkPromise;
}

/**
 * No-op plugin loader — plugins require OAuth JWT which this key doesn't support.
 * Kept for API compatibility.
 */
export function loadMapplsPlugins() {
  return Promise.resolve(window.mappls);
}

function waitFor(conditionFn, maxRetries = 20, intervalMs = 300) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      if (conditionFn()) {
        resolve();
      } else if (attempts < maxRetries) {
        attempts++;
        setTimeout(check, intervalMs);
      } else {
        reject(new Error('Condition not met after waiting'));
      }
    };
    check();
  });
}

// ─── OAuth Token ───────────────────────────────────────────────

let cachedToken = null;
let tokenExpiry = 0;

/**
 * Get Mappls OAuth access token (if client credentials are provided).
 * Uses Vite proxy at /mappls-auth to bypass CORS.
 */
async function getMapplsToken() {
  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const clientId = MAPPLS_CLIENT_ID || MAPPLS_KEY;
  const clientSecret = MAPPLS_CLIENT_SECRET || MAPPLS_KEY;

  try {
    const resp = await fetch('/mappls-auth/api/security/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`,
    });

    if (resp.ok) {
      const data = await resp.json();
      if (data.access_token) {
        cachedToken = data.access_token;
        // Expire 5 minutes before actual expiry
        tokenExpiry = Date.now() + ((data.expires_in || 3600) - 300) * 1000;
        console.log('✅ Mappls OAuth token acquired');
        return cachedToken;
      }
    }
    console.warn('⚠️ Mappls OAuth failed:', resp.status);
  } catch (e) {
    console.warn('⚠️ Mappls OAuth error:', e.message);
  }

  return null;
}

// ─── Nearby Search ─────────────────────────────────────────────

/**
 * Search for nearby Jan Aushadhi stores.
 * Strategy:
 *   1. Mappls REST API via Vite proxy (with OAuth token)
 *   2. Backend store API fallback (/api/v1/stores/nearby)
 */
export async function searchNearbyStores(mapInstance, lat, lng) {
  // Strategy 1: Mappls REST API via proxy
  console.log('🔍 Trying Mappls REST API via proxy...');
  const token = await getMapplsToken();
  if (token) {
    const results = await searchViaMapplsAPI(token, lat, lng);
    if (results.length > 0) {
      console.log(`✅ Found ${results.length} stores via Mappls API`);
      return results;
    }
  }

  // Strategy 2: Existing backend store API
  console.log('🔍 Trying backend store API fallback...');
  const backendResults = await searchViaBackend(lat, lng);
  if (backendResults.length > 0) {
    console.log(`✅ Found ${backendResults.length} stores via backend`);
    return backendResults;
  }

  console.warn('❌ All search strategies exhausted. No stores found.');
  return [];
}

/**
 * Strategy 1: Mappls REST API (nearby + textsearch) via Vite proxy.
 */
async function searchViaMapplsAPI(token, lat, lng) {
  const queries = ['Jan Aushadhi', 'Janaushadhi Kendra'];
  let allResults = [];

  for (const query of queries) {
    // Try nearby endpoint
    try {
      const url = `/mappls-api/api/places/nearby/json?keywords=${encodeURIComponent(query)}&refLocation=${lat},${lng}&radius=10000`;
      const resp = await fetch(url, {
        headers: { 'Authorization': `bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        const items = data.suggestedLocations || data.results || [];
        allResults = [...allResults, ...items];
        if (items.length > 0) continue; // got results, skip textsearch for this query
      }
    } catch (e) {
      // Network error, try next
    }

    // Try textsearch endpoint
    try {
      const url = `/mappls-api/api/places/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=10000&region=ind`;
      const resp = await fetch(url, {
        headers: { 'Authorization': `bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        const items = data.suggestedLocations || data.results || [];
        allResults = [...allResults, ...items];
      }
    } catch (e) {
      // Network error
    }
  }

  return processResults(allResults, lat, lng);
}

/**
 * Strategy 2: Existing backend store API (MongoDB-backed).
 */
async function searchViaBackend(lat, lng) {
  const backendUrl = import.meta.env.VITE_API_URL || '';
  const baseUrl = backendUrl.endsWith('/api/v1') ? backendUrl : `${backendUrl}/api/v1`;
  try {
    const resp = await fetch(`${baseUrl}/stores/nearby?lat=${lat}&lng=${lng}&maxDistance=10000`);
    if (resp.ok) {
      const data = await resp.json();
      if (data.success && data.data && data.data.length > 0) {
        return data.data.map(store => ({
          id: store._id || `${store.location?.coordinates?.[1]}_${store.location?.coordinates?.[0]}`,
          placeName: store.name || 'Jan Aushadhi Store',
          placeAddress: [store.address, store.city, store.state].filter(Boolean).join(', '),
          lat: store.location?.coordinates?.[1] || 0,
          lng: store.location?.coordinates?.[0] || 0,
          distance: null,
          eLoc: null,
          phone: store.phone || null,
          category: 'Jan Aushadhi',
        }));
      }
    }
  } catch (e) {
    console.warn('Backend store API error:', e.message);
  }
  return [];
}

// ─── Result Processing ─────────────────────────────────────────

function processResults(rawResults, userLat, userLng) {
  const unique = deduplicateStores(rawResults);
  const stores = unique.map(normalizeStore);
  stores.sort((a, b) => {
    const dA = haversineDistance(userLat, userLng, a.lat, a.lng);
    const dB = haversineDistance(userLat, userLng, b.lat, b.lng);
    return dA - dB;
  });
  return stores;
}

function deduplicateStores(stores) {
  const seen = new Set();
  return stores.filter((store) => {
    const key = store.eLoc || `${store.latitude || store.lat}_${store.longitude || store.lng}_${store.placeName || store.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeStore(raw) {
  return {
    id: raw.eLoc || raw.placeId || `${raw.latitude || raw.lat}_${raw.longitude || raw.lng}`,
    placeName: raw.placeName || raw.name || raw.poi || 'Jan Aushadhi Store',
    placeAddress: raw.placeAddress || raw.address || raw.vicinity || raw.formatted_address || '',
    lat: parseFloat(raw.latitude || raw.lat || 0),
    lng: parseFloat(raw.longitude || raw.lng || 0),
    distance: raw.distance ? parseFloat(raw.distance) : null,
    eLoc: raw.eLoc || null,
    phone: raw.contactNumber || raw.phone || raw.tel || null,
    category: raw.categoryCode || raw.keywords || raw.type || '',
  };
}

// ─── Haversine Distance ────────────────────────────────────────

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// ─── Find Nearest Store ────────────────────────────────────────

export function findNearestStore(stores, userLat, userLng) {
  if (!stores || stores.length === 0) return null;

  let nearest = null;
  let minDist = Infinity;

  stores.forEach((store) => {
    const dist = haversineDistance(userLat, userLng, store.lat, store.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = store;
    }
  });

  return nearest ? { store: nearest, distance: minDist } : null;
}
