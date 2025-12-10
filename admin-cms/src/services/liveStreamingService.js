import api from './api';

export const liveStreamingService = {
  getAll: async () => {
    const response = await api.get('/live-streaming');
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/live-streaming', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/live-streaming/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/live-streaming/${id}`);
  },
};
