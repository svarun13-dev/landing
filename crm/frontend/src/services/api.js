import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Contacts
export const contactsAPI = {
  getAll: (params) => api.get('/contacts/', { params }),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts/', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  getDeals: (id) => api.get(`/contacts/${id}/deals`),
  getActivities: (id) => api.get(`/contacts/${id}/activities`),
};

// Deals
export const dealsAPI = {
  getAll: (params) => api.get('/deals/', { params }),
  getById: (id) => api.get(`/deals/${id}`),
  getPipeline: () => api.get('/deals/pipeline'),
  create: (data) => api.post('/deals/', data),
  update: (id, data) => api.put(`/deals/${id}`, data),
  updateStage: (id, stage) => api.patch(`/deals/${id}/stage`, null, { params: { stage } }),
  delete: (id) => api.delete(`/deals/${id}`),
};

// Dashboard
export const dashboardAPI = {
  getMetrics: () => api.get('/dashboard/metrics'),
};

// Activities
export const activitiesAPI = {
  getAll: (params) => api.get('/activities/', { params }),
  getById: (id) => api.get(`/activities/${id}`),
  create: (data) => api.post('/activities/', data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`),
};

export default api;
