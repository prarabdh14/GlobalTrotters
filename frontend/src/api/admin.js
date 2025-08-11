import { http } from './client';

export const adminApi = {
  overview: () => http.get('/api/admin/overview'),
  users: (params = {}) => http.get(`/api/admin/users${toQuery(params)}`),
  userDetails: (id) => http.get(`/api/admin/users/${id}`),
  analytics: (params = {}) => http.get(`/api/admin/analytics${toQuery(params)}`),
  monthlyAnalytics: (params = {}) => http.get(`/api/admin/analytics/monthly${toQuery(params)}`),
  deleteUser: (id) => http.del(`/api/admin/users/${id}`),
};

function toQuery(params) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return '';
  const q = new URLSearchParams(entries).toString();
  return `?${q}`;
}

export default adminApi; 