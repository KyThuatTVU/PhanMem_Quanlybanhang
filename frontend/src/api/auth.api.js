import apiClient from './apiClient';

export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  googleLogin: (idToken) => apiClient.post('/auth/google', { idToken }),
  getProfile: () => apiClient.get('/auth/me'),
  changePassword: (data) => apiClient.put('/auth/change-password', data),
  logout: () => apiClient.post('/auth/logout'),
};
