import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('team-task-token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('team-task-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  signup: (payload) => api.post('/auth/signup', payload),
  login: (payload) => api.post('/auth/login', payload),
  getMe: () => api.get('/auth/me')
};

export const projectService = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  remove: (id) => api.delete(`/projects/${id}`),
  addMember: (id, data) => api.post(`/projects/${id}/members`, data),
  removeMember: (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`)
};

export const taskService = {
  getAll: (projectId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.assigneeId) params.append('assigneeId', filters.assigneeId);
    return api.get(`/projects/${projectId}/tasks`, { params });
  },
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  update: (projectId, taskId, data) => api.put(`/projects/${projectId}/tasks/${taskId}`, data),
  updateStatus: (projectId, taskId, status) => api.patch(`/projects/${projectId}/tasks/${taskId}/status`, { status }),
  remove: (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`)
};

export const dashboardService = {
  get: () => api.get('/dashboard')
};

export default api;
