import api from './api';

export const subcategoryService = {
  getAll: async () => {
    const response = await api.get('/subcategories');
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/subcategories/${id}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/subcategories', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/subcategories/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/subcategories/${id}`);
  },
};
