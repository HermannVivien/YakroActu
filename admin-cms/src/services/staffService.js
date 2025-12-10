import api from './api';

const staffService = {
  getAll: async () => {
    const response = await api.get('/staff');
    return response.data.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/staff/${id}`);
    return response.data.data;
  },
  
  create: async (data) => {
    const response = await api.post('/staff', data);
    return response.data.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/staff/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/staff/${id}`);
    return response.data.data;
  }
};

export { staffService };
