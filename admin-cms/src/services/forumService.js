import api from './api';

const forumService = {
  // Categories
  getAllCategories: () => api.get('/forum/categories'),
  createCategory: (data) => api.post('/forum/categories', data),
  updateCategory: (id, data) => api.put(`/forum/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/forum/categories/${id}`),

  // Topics
  getAllTopics: (params) => api.get('/forum/topics', { params }),
  getTopicById: (id) => api.get(`/forum/topics/${id}`),
  createTopic: (data) => api.post('/forum/topics', data),
  updateTopic: (id, data) => api.put(`/forum/topics/${id}`, data),
  deleteTopic: (id) => api.delete(`/forum/topics/${id}`),

  // Posts
  createPost: (data) => api.post('/forum/posts', data),
  updatePost: (id, data) => api.put(`/forum/posts/${id}`, data),
  deletePost: (id) => api.delete(`/forum/posts/${id}`),
  votePost: (id, type) => api.post(`/forum/posts/${id}/vote`, { type })
};

export default forumService;
