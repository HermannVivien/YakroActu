import api from './api';

export const breakingNewsService = {
  getAll: async () => {
    const response = await api.get('/breaking-news');
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/breaking-news', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/breaking-news/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/breaking-news/${id}`);
  },
};
