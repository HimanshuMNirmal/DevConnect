import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR - ADD JWT TOKEN TO ALL REQUESTS
// Automatically attach Bearer token from localStorage to Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AUTHENTICATION API
// Handles user registration and login operations
export const authAPI = {
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
};

// POSTS API
// Handles CRUD operations for posts, likes, and comments
export const postAPI = {
  getAllPosts: (page = 1, limit = 10, search = '', tags = '') => 
    api.get('/posts', { params: { page, limit, search, tags } }),
  getPostById: (id) => api.get(`/posts/${id}`),
  createPost: (title, content, tags) =>
    api.post('/posts', { title, content, tags }),
  updatePost: (id, title, content, tags) =>
    api.put(`/posts/${id}`, { title, content, tags }),
  deletePost: (id) => api.delete(`/posts/${id}`),
  toggleLike: (id) => api.post(`/posts/${id}/like`),
  
  createComment: (postId, content) =>
    api.post(`/posts/${postId}/comments`, { content }),
  getComments: (postId, page = 1, limit = 10) =>
    api.get(`/posts/${postId}/comments`, { params: { page, limit } }),
  updateComment: (commentId, content) =>
    api.put(`/posts/comments/${commentId}`, { content }),
  deleteComment: (commentId) =>
    api.delete(`/posts/comments/${commentId}`),
};

// USERS API
// Handles user profile search and information retrieval
export const userAPI = {
  searchUsers: (query) => api.get('/users/search', { params: { query } }),
  getUserProfile: (id, page = 1, limit = 10) => api.get(`/users/${id}`, { params: { page, limit } }),
  updateUserProfile: (id, bio, skills, profile_pic) =>
    api.put(`/users/${id}`, { bio, skills, profile_pic }),
};

// MESSAGES API
// Handles direct messaging and conversation management
export const messageAPI = {
  getConversations: () => api.get('/messages/conversations/list'),
  getMessages: (userId, page = 1, limit = 50) => api.get(`/messages/${userId}`, { params: { page, limit } }),
  sendMessage: (receiverId, message) =>
    api.post('/messages', { receiverId, message }),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
  markConversationAsRead: (userId) => api.put(`/messages/${userId}/conversation/read`),
};

export default api;
