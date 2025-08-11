import { http } from './client';

export const authApi = {
  // Register new user
  register: (userData) => http.post('/api/auth/register', userData),

  // Login user
  login: (credentials) => http.post('/api/auth/login', credentials),

  // Google OAuth login
  googleLogin: (idToken) => http.post('/api/auth/google', { idToken }),

  // Get current user profile
  me: () => http.get('/api/auth/me'),

  // Update user profile
  updateProfile: (userData) => http.put('/api/auth/me', userData),

  // Change password
  changePassword: (passwordData) => http.put('/api/auth/change-password', passwordData),

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('gt_token');
    localStorage.removeItem('user');
  }
}; 