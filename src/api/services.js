import api from './axios';

export const servicesApi = {
  getAll: () => api.get('/services').then(r => r.data),
  getById: (id) => api.get(`/services/${id}`).then(r => r.data),
  create: (data) => api.post('/services', data).then(r => r.data),
  update: (id, data) => api.put(`/services/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/services/${id}`).then(r => r.data),
};