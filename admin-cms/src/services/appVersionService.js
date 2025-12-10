import api from './api';

export const appVersionService = {
  getAll: async () => {
    const response = await api.get('/app-versions');
    return response.data.data;
  },

  getLatest: async (platform) => {
    const response = await api.get(`/app-versions/latest/${platform}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/app-versions', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/app-versions/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/app-versions/${id}`);
  },
};
