import { http } from './client';

export const activitiesApi = {
  list: (params = {}) => http.get(`/api/activities${toQuery(params)}`),
  get: (id) => http.get(`/api/activities/${id}`),
  byCity: (cityId, params = {}) => http.get(`/api/activities/city/${cityId}${toQuery(params)}`),
  byType: (type, params = {}) => http.get(`/api/activities/type/${encodeURIComponent(type)}${toQuery(params)}`),
  popular: (params = {}) => http.get(`/api/activities/popular/list${toQuery(params)}`),
  types: () => http.get('/api/activities/types/list'),
  stats: () => http.get('/api/activities/stats/overview'),
};

function toQuery(params) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return '';
  const q = new URLSearchParams(entries).toString();
  return `?${q}`;
}

export default activitiesApi; 