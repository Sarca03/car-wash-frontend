import api from './axios';

export const vehiclesApi = {
  getAll: () => api.get('/vehicles').then(r => r.data),
  getById: (id) => api.get(`/vehicles/${id}`).then(r => r.data),
  getByClient: (clientId) => api.get(`/vehicles/client/${clientId}`).then(r => r.data),
  create: (data) => api.post('/vehicles', data).then(r => r.data),
  update: (id, data) => api.put(`/vehicles/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/vehicles/${id}`).then(r => r.data),
};