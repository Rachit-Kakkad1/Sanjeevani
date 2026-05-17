import axios from 'axios';

const getBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  if (envUrl.endsWith('/')) envUrl = envUrl.slice(0, -1);
  return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`;
};

const API_BASE_URL = getBaseUrl();
export { API_BASE_URL };

export const uploadBill = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await axios.post(`${API_BASE_URL}/bills/upload`, formData, {
    headers: {
      ...headers,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

export const getBillHistory = async () => {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await axios.get(`${API_BASE_URL}/bills/history`, { headers });
  return response.data.data;
};

export const getJobStatus = async (jobId) => {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await axios.get(`${API_BASE_URL}/bills/job/${jobId}`, { headers });
  return response.data.data;
};

export const checkBackend = async () => {
  try {
    let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    if (baseUrl.endsWith('/api/v1')) baseUrl = baseUrl.replace('/api/v1', '');
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
    
    const healthUrl = `${baseUrl}/health`;
    const response = await axios.get(healthUrl);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export const getSSEUrl = (jobId) => `${API_BASE_URL}/bills/job/${jobId}/stream`;