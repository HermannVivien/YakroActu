import api from './api';

const sportConfigService = {
  getAll: () => api.get('/sport-config'),
  getActive: () => api.get('/sport-config/active'),
  create: (data) => api.post('/sport-config', data),
  update: (id, data) => api.put(`/sport-config/${id}`, data),
  delete: (id) => api.delete(`/sport-config/${id}`)
};

export default sportConfigService;
