import api from './api';

const featuredSectionService = {
  getAll: async () => {
    const response = await api.get('/featured-sections');
    return response.data.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/featured-sections/${id}`);
    return response.data.data;
  },
  
  create: async (data) => {
    const response = await api.post('/featured-sections', data);
    return response.data.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/featured-sections/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/featured-sections/${id}`);
    return response.data.data;
  }
};

export { featuredSectionService };
