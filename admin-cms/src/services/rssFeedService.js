import api from './api';

export const rssFeedService = {
  getAll: async () => {
    const response = await api.get('/rss-feeds');
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/rss-feeds', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/rss-feeds/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/rss-feeds/${id}`);
  },
};
