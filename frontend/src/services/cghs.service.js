import axios from 'axios';

const getBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  if (envUrl.endsWith('/')) envUrl = envUrl.slice(0, -1);
  return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`;
};

const API_BASE_URL = getBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getCghsProcedures = async (params) => {
  try {
    const response = await apiClient.get('/cghs/procedures', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'FETCH_FAILED');
  }
};

export const getClassifications = async () => {
  try {
    const response = await apiClient.get('/cghs/classifications');
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'FETCH_FAILED');
  }
};

export default {
  getCghsProcedures,
  getClassifications,
};
