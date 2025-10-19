import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  login: (email, password) =>
    api.post('/login', new URLSearchParams({ username: email, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }),
  register: (userData) => api.post('/users/', userData),
};

// User/Profile endpoints
export const userAPI = {
  getProfile: (userId) => api.get(`/profile/${userId}`),
  getMyProfile: () => api.get('/profile/me'),
  updateProfile: (data) => api.put('/profile/me', data),
  getUserPosts: (userId, limit = 10, skip = 0) =>
    api.get(`/profile/${userId}/posts?limit=${limit}&skip=${skip}`),
};

// Post endpoints
export const postAPI = {
  createPost: (postData) => api.post('/posts', postData),
  getPosts: (limit = 10, skip = 0) => api.get(`/posts?limit=${limit}&skip=${skip}`),
  getPost: (postId) => api.get(`/posts/${postId}`),
  updatePost: (postId, data) => api.put(`/posts/${postId}`, data),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  votePost: (postId, dir) => api.post(`/vote/`, { post_id: postId, dir }),
};

// Comments endpoints
export const commentAPI = {
  getCommentsForPost: (postId) => api.get(`/posts/${postId}/comments`),
  addCommentToPost: (postId, comment) => api.post(`/posts/${postId}/comment`, { comment }),
  replyToComment: (commentId, comment) => api.post(`/posts/${commentId}/reply`, { comment }),
  likeComment: (commentId) => api.post(`/posts/comments/${commentId}/like`, null, { params: { dir: 1 } }),
  unlikeComment: (commentId) => api.post(`/posts/comments/${commentId}/like`, null, { params: { dir: 0 } }),
  getCommentLikesMap: (postId) => api.get(`/posts/${postId}/comments/likes`),
};

export default api;
