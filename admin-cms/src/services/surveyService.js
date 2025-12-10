import api from './api';

export const surveyService = {
  getAll: async () => {
    const response = await api.get('/surveys');
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/surveys', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/surveys/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/surveys/${id}`);
  },
};
