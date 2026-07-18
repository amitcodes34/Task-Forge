// =============================================================================
// src/services/api.js – Axios API Client
// =============================================================================
// Centralized HTTP client with auth token injection and token refresh logic.
// All API calls go through this instance – never raw fetch() or separate axios
// instances – so auth headers are always consistent.
// =============================================================================

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ---------------------------------------------------------------------------
// Request Interceptor – Inject Access Token
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response Interceptor – Handle 401 with Token Refresh
// ---------------------------------------------------------------------------
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401 and haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while we wait for the refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // No refresh token – force logout
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const newAccessToken = data.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  getMe: () => api.get('/auth/me'),
};

// ---------------------------------------------------------------------------
// Projects API
// ---------------------------------------------------------------------------
export const projectsAPI = {
  list: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  deliver: (id, data) => api.post(`/projects/${id}/deliver`, data || {}),
  complete: (id) => api.post(`/projects/${id}/complete`),
};

// ---------------------------------------------------------------------------
// Bids API
// ---------------------------------------------------------------------------
export const bidsAPI = {
  create: (projectId, data) => api.post(`/projects/${projectId}/bids`, data),
  list: (projectId) => api.get(`/projects/${projectId}/bids`),
  update: (bidId, data) => api.put(`/bids/${bidId}`, data),
  delete: (bidId) => api.delete(`/bids/${bidId}`),
  accept: (bidId) => api.post(`/bids/${bidId}/accept`),
};

// ---------------------------------------------------------------------------
// Freelancers API
// ---------------------------------------------------------------------------
export const freelancersAPI = {
  list: (params) => api.get('/freelancers', { params }),
};

// ---------------------------------------------------------------------------
// Reviews API
// ---------------------------------------------------------------------------
export const reviewsAPI = {
  create: (data) => api.post('/reviews', data),
};

// ---------------------------------------------------------------------------
// Admin API
// ---------------------------------------------------------------------------
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getProjects: (params) => api.get('/admin/projects', { params }),
  getStats: () => api.get('/admin/stats'),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  banUser: (id) => api.patch(`/admin/users/${id}/ban`),
  unbanUser: (id) => api.patch(`/admin/users/${id}/unban`),
};

export default api;
