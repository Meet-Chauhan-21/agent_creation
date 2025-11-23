import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API methods
export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

export const users = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
};

export const projects = {
  getAll: () => api.get('/projects'),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const workflows = {
  getAll: (projectId) => api.get(`/projects/${projectId}/workflows`),
  getOne: (id) => api.get(`/workflows/${id}`),
  create: (projectId, data) => api.post(`/projects/${projectId}/workflows`, data),
  update: (id, data) => api.put(`/workflows/${id}`, data),
  duplicate: (id) => api.post(`/workflows/${id}/duplicate`),
  delete: (id) => api.delete(`/workflows/${id}`),
  run: (id, input) => api.post(`/workflows/${id}/run`, { input }),
  getRuns: (id) => api.get(`/workflows/${id}/runs`),
};

export const runs = {
  getOne: (id) => api.get(`/runs/${id}`),
};

export const secrets = {
  getAll: () => api.get('/secrets'),
  getOne: (id) => api.get(`/secrets/${id}`),
  create: (data) => api.post('/secrets', data),
  update: (id, data) => api.put(`/secrets/${id}`, data),
  delete: (id) => api.delete(`/secrets/${id}`),
};

export const nodes = {
  getAll: () => api.get('/nodes'),
  getOne: (id) => api.get(`/nodes/${id}`),
};
