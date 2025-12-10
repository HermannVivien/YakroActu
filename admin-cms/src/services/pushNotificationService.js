import api from './api';

export const pushNotificationService = {
  getAll: async () => {
    const response = await api.get('/push-notifications');
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/push-notifications', data);
    return response.data.data;
  },

  send: async (id) => {
    const response = await api.post(`/push-notifications/send/${id}`);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/push-notifications/${id}`);
  },
};
