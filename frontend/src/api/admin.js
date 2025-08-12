import { http } from './client';

export const adminApi = {
  // Admin login
  login: (credentials) => http.post('/api/admin/login', credentials),

  // Get dashboard stats
  getDashboardStats: () => http.get('/api/admin/dashboard'),

  // Get users with pagination
  getUsers: (params = {}) => http.get(`/api/admin/users${toQuery(params)}`),

  // Get trips with pagination
  getTrips: (params = {}) => http.get(`/api/admin/trips${toQuery(params)}`),

  // Get analytics
  getAnalytics: () => http.get('/api/admin/analytics'),
};

// Helper function to convert params object to query string
function toQuery(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
} 