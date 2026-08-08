import axios from 'axios';

// Create an axios instance with base URL from environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request interceptor to add auth token (if available)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Users Service
export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  getByRole: (role) => api.get(`/users/role/${role}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
};

// Area Blocks Service
export const areaBlockService = {
  getAll: () => api.get('/areaBlocks'),
  create: (data) => api.post('/areaBlocks', data),
};

// Consumer Service
export const consumerService = {
  getAll: () => api.get('/consumers'),
  getById: (id) => api.get(`/consumers/${id}`),
  create: (data) => api.post('/consumers', data),
  update: (id, data) => api.put(`/consumers/${id}`, data),
  delete: (id) => api.delete(`/consumers/${id}`),
};

// Projects Service
export const projectService = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  updateStatus: (id, data) => api.patch(`/projects/${id}/status`, data),
};

// Documents Service
export const documentService = {
  getAll: () => api.get('/documents'),
  getById: (id) => api.get(`/documents/${id}`),
  getByConsumer: (consumerId) => api.get(`/documents/consumer/${consumerId}`),
  getStatusSummary: () => api.get('/documents/status-summary'),
  create: (data) => api.post('/documents', data),
  upload: (data) => api.post('/documents', data),
  verify: (id, data) => api.patch(`/documents/${id}/verify`, data),
  reject: (id, data) => api.patch(`/documents/${id}/reject`, data),
  reupload: (id, data) => api.post(`/documents/${id}/reupload`, data),
};

// Bank Loans Service
export const bankLoanService = {
  getByConsumer: (consumerId) => api.get(`/bank-loans/consumer/${consumerId}`),
  createOrUpdate: (data) => api.post('/bank-loans', data),
};

// Actions Required Service
export const actionService = {
  getAll: () => api.get('/actions'),
  create: (data) => api.post('/actions', data),
  updateStatus: (id, data) => api.patch(`/actions/${id}/status`, data),
  resolve: (id, data) => api.patch(`/actions/${id}/status`, { status: 'resolved', ...data }),
};

// Installation Progress Service
export const installationService = {
  getByProject: (projectId) => api.get(`/installation/project/${projectId}`),
  initChecklist: (projectId) => api.post(`/installation/project/${projectId}/init`),
  completeItem: (id, data) => api.patch(`/installation/${id}/complete`, data),
  saveBatch: (projectId, data) => api.post(`/installation/project/${projectId}/batch`, data),
  getProgress: (projectId) => api.get(`/installation/project/${projectId}/progress`),
};

// Payments Service
export const paymentService = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  getByProject: (projectId) => api.get(`/payments/project/${projectId}`),
  getPending: () => api.get('/payments/pending'),
  getSummary: () => api.get('/payments/summary'),
  create: (data) => api.post('/payments', data),
  updateStatus: (id, data) => api.patch(`/payments/${id}/status`, data),
};

// Notifications Service
export const notificationService = {
  getAll: () => api.get('/notifications'),
  getUserNotifications: (userId) => api.get(`/notifications/user/${userId}`),
  create: (data) => api.post('/notifications', data),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export default api;