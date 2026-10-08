import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: standard unwrap & error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data; // Return { success, message, data }
  },
  (error) => {
    if (error.response) {
      // 401 Unauthorized -> clear token
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login?expired=1';
        }
      }
      return Promise.reject(error.response.data || { message: 'Server error occurred' });
    } else if (error.request) {
      return Promise.reject({ message: 'Unable to reach the server. Please check your internet connection.' });
    } else {
      return Promise.reject({ message: error.message || 'An unexpected error occurred' });
    }
  }
);

export default apiClient;
