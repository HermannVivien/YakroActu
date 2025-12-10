import api from './api';

export const articleService = {
  getAll: async (params = {}) => {
    const response = await api.get('/articles', { params });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/articles/${id}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/articles', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/articles/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/articles/${id}`);
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.url;
  },
};
