import api from './api';

const reportageService = {
  getAll: (params) => api.get('/reportages', { params }),
  getById: (id) => api.get(`/reportages/${id}`),
  create: (data) => api.post('/reportages', data),
  update: (id, data) => api.put(`/reportages/${id}`, data),
  delete: (id) => api.delete(`/reportages/${id}`),
  incrementView: (id) => api.post(`/reportages/${id}/view`)
};

export default reportageService;
