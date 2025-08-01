import axios from 'axios';

<<<<<<< HEAD
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
=======
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
>>>>>>> 35a05ca402893838a7737735b9ed3fae733f5343
  headers: {
    'Content-Type': 'application/json',
  },
});

<<<<<<< HEAD
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
=======
// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
>>>>>>> 35a05ca402893838a7737735b9ed3fae733f5343
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

<<<<<<< HEAD
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
=======
// Auth endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verifyEmail: (token) => api.get(`/auth/verify/${token}`),
};

// User endpoints
export const userAPI = {
  getProfile: (id) => api.get(`/account/${id}`),
  updateProfile: (id, data) => api.put(`/account/${id}`, data),
  changePassword: (id, data) => api.put(`/account/${id}/password`, data),
  deleteAccount: (id) => api.delete(`/account/${id}`),
};

// Shipment endpoints
export const shipmentAPI = {
  createShipment: (data) => api.post('/shipments', data),
  calculateCost: (data) => api.post('/shipments/calculate-cost', data),
  getShipmentHistory: () => api.get('/shipments/history'),
  getShipments: () => api.get('/shipments'),
  getShipmentById: (id) => api.get(`/shipments/${id}`),
  updateShipmentStatus: (id, status) => api.put(`/shipments/${id}/status`, { status }),
  deleteShipment: (id) => api.delete(`/shipments/${id}`),
};

// Settings endpoints
export const settingsAPI = {
  getCountries: () => api.get('/settings/countries'),
  getBoxTypes: () => api.get('/settings/box-types'),
  createCountry: (data) => api.post('/settings/countries', data),
  updateCountry: (id, data) => api.put(`/settings/countries/${id}`, data),
};

// Admin endpoints
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: () => api.get('/admin/analytics'),
  getAdminLogs: () => api.get('/admin/logs'),
  getAllShipments: () => api.get('/admin/shipments'),
  updateShipmentStatus: (id, status) => api.put(`/admin/shipments/${id}/status`, { status }),
  getAllUsers: () => api.get('/admin/users'),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  exportReport: () => api.get('/admin/reports/export'),
};

export default api;
>>>>>>> 35a05ca402893838a7737735b9ed3fae733f5343
