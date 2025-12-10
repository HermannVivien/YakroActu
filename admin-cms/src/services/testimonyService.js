import api from './api';

const testimonyService = {
  getAll: (params) => api.get('/testimonies', { params }),
  getById: (id) => api.get(`/testimonies/${id}`),
  create: (data) => api.post('/testimonies', data),
  update: (id, data) => api.put(`/testimonies/${id}`, data),
  approve: (id) => api.post(`/testimonies/${id}/approve`),
  reject: (id) => api.post(`/testimonies/${id}/reject`),
  delete: (id) => api.delete(`/testimonies/${id}`)
};

export default testimonyService;
