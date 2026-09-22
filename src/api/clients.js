import api from './axios';

export const clientsApi = {
  getAll: () => api.get('/clients').then(r => r.data),
  getById: (id) => api.get(`/clients/${id}`).then(r => r.data),
  create: (data) => api.post('/clients', data).then(r => r.data),
  update: (id, data) => api.put(`/clients/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/clients/${id}`).then(r => r.data),
};