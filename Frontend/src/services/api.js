import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
