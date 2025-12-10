import api from './api';

export const authorService = {
  getAll: async () => {
    const response = await api.get('/authors');
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/authors', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/authors/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/authors/${id}`);
  },
};
