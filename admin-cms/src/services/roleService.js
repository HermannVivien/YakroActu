import api from './api';

const roleService = {
  getAll: async () => {
    const response = await api.get('/roles');
    return response.data.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response.data.data;
  },
  
  create: async (data) => {
    const response = await api.post('/roles', data);
    return response.data.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/roles/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data.data;
  }
};

export { roleService };
