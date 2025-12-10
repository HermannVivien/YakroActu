import api from './api';

export const pharmacyService = {
  getAll: async () => {
    const response = await api.get('/pharmacies');
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/pharmacies', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/pharmacies/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/pharmacies/${id}`);
  },
};
