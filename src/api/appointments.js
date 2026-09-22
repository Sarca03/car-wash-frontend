import api from './axios';

export const appointmentsApi = {
  getAll: () => api.get('/appointments').then(r => r.data),
  getById: (id) => api.get(`/appointments/${id}`).then(r => r.data),
  getStats: () => api.get('/appointments/stats').then(r => r.data),
  create: (data) => api.post('/appointments', data).then(r => r.data),
  update: (id, data) => api.put(`/appointments/${id}`, data).then(r => r.data),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }).then(r => r.data),
  remove: (id) => api.delete(`/appointments/${id}`).then(r => r.data),
};