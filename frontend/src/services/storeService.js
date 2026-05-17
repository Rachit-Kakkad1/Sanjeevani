import axios from 'axios';

const getBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  if (envUrl.endsWith('/')) envUrl = envUrl.slice(0, -1);
  return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`;
};

const API_URL = getBaseUrl();

/**
 * Fetch nearby Jan Aushadhi stores from the backend
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} maxDistance - Maximum distance in meters (default 10000)
 * @returns {Promise} - Axios promise
 */
export const fetchNearbyStores = async (lat, lng, maxDistance = 10000) => {
  try {
    const response = await axios.get(`${API_URL}/stores/nearby`, {
      params: { lat, lng, maxDistance }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching nearby stores:', error);
    throw error;
  }
};

/**
 * Utility to calculate Haversine distance (as fallback or for sorting)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
