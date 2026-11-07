import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://glp-backend-gamma.vercel.app/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor: attach admin JWT token
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('glp_crm_token');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error attaching auth token to request:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('glp_crm_token');
      localStorage.removeItem('glp_crm_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
