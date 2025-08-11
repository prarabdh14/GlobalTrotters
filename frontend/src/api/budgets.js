import { http } from './client';

export const budgetsApi = {
  listForTrip: (tripId) => http.get(`/api/budgets/trip/${tripId}`),
  addToTrip: (tripId, payload) => http.post(`/api/budgets/trip/${tripId}`, payload),
  updateItem: (id, payload) => http.put(`/api/budgets/${id}`, payload),
  removeItem: (id) => http.del(`/api/budgets/${id}`),
  tripSummary: (tripId) => http.get(`/api/budgets/trip/${tripId}/summary`),
  userStats: (params = {}) => http.get(`/api/budgets/user/stats${toQuery(params)}`),
  categories: () => http.get('/api/budgets/categories/list'),
};

function toQuery(params) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return '';
  const q = new URLSearchParams(entries).toString();
  return `?${q}`;
}

export default budgetsApi; 