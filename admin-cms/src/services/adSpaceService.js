import api from './api';

const adSpaceService = {
  getAll: async () => {
    const response = await api.get('/ad-spaces');
    return response.data.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/ad-spaces/${id}`);
    return response.data.data;
  },
  
  create: async (data) => {
    const response = await api.post('/ad-spaces', data);
    return response.data.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/ad-spaces/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/ad-spaces/${id}`);
    return response.data.data;
  }
};

export { adSpaceService };
