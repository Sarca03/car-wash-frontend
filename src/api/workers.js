import api from './axios';

export const workersApi = {
  getAll: () => api.get('/workers').then(r => r.data),
  getById: (id) => api.get(`/workers/${id}`).then(r => r.data),
  create: (data) => api.post('/workers', data).then(r => r.data),
  update: (id, data) => api.put(`/workers/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/workers/${id}`).then(r => r.data),
};