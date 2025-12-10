import api from './api';

export const tagService = {
  getAll: async () => {
    const response = await api.get('/tags');
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/tags', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/tags/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/tags/${id}`);
  },
};
