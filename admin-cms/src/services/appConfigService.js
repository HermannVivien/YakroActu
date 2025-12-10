import api from './api';

export const appConfigService = {
  getAll: async () => {
    const response = await api.get('/app-config');
    return response.data.data;
  },

  getByPlatform: async (platform) => {
    const response = await api.get(`/app-config/${platform}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/app-config', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/app-config/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/app-config/${id}`);
  },
};
