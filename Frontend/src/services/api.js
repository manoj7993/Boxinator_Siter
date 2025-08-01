import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('boxinator_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('boxinator_token');
      localStorage.removeItem('boxinator_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: () => apiClient.post('/auth/refresh'),
  verifyEmail: (token) => apiClient.post('/auth/verify-email', { token }),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password }),
};

// User API
export const userAPI = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data) => apiClient.patch('/user/profile', data),
  changePassword: (data) => apiClient.patch('/user/change-password', data),
};

// Shipment API
export const shipmentAPI = {
  getShipments: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/shipments${queryString ? `?${queryString}` : ''}`);
  },
  getShipment: (id) => apiClient.get(`/shipments/${id}`),
  createShipment: (data) => apiClient.post('/shipments', data),
  updateShipment: (id, data) => apiClient.patch(`/shipments/${id}`, data),
  updateShipmentStatus: (id, status) => apiClient.patch(`/shipments/${id}/status`, { status }),
  calculateCost: (data) => apiClient.post('/shipments/calculate-cost', data),
  getStats: () => apiClient.get('/shipments/stats'),
  trackShipment: (trackingId) => apiClient.get(`/shipments/track/${trackingId}`),
};

// Countries API (deprecated - use settingsAPI.getCountries instead)
export const countriesAPI = {
  getCountries: () => apiClient.get('/settings/countries'),
  getCountry: (id) => apiClient.get(`/countries/${id}`),
};

// Admin API
export const adminAPI = {
  getOverview: () => apiClient.get('/admin/overview'),
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },
  getUser: (id) => apiClient.get(`/admin/users/${id}`),
  updateUserStatus: (id, status) => apiClient.patch(`/admin/users/${id}/status`, { status }),
  getShipments: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/admin/shipments${queryString ? `?${queryString}` : ''}`);
  },
  updateShipmentStatus: (id, status) => apiClient.patch(`/admin/shipments/${id}/status`, { status }),
  addCountry: (data) => apiClient.post('/admin/countries', data),
  updateCountry: (id, data) => apiClient.patch(`/admin/countries/${id}`, data),
  deleteCountry: (id) => apiClient.delete(`/admin/countries/${id}`),
  getAuditLogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/admin/audit${queryString ? `?${queryString}` : ''}`);
  },
};

// Settings API
export const settingsAPI = {
  getSettings: () => apiClient.get('/settings'),
  updateSettings: (data) => apiClient.patch('/settings', data),
  getCountries: () => apiClient.get('/settings/countries'),
  getBoxTypes: () => apiClient.get('/settings/box-types'),
};

export default apiClient;
