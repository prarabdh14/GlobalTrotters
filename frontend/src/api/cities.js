import { http } from './client';

export const citiesApi = {
  list: (params = {}) => http.get(`/api/cities${toQuery(params)}`),
  get: (id) => http.get(`/api/cities/${id}`),
  popular: (params = {}) => http.get(`/api/cities/popular/list${toQuery(params)}`),
  byRegion: (region, params = {}) => http.get(`/api/cities/region/${encodeURIComponent(region)}${toQuery(params)}`),
  byCost: (level, params = {}) => http.get(`/api/cities/cost/${encodeURIComponent(level)}${toQuery(params)}`),
  stats: () => http.get('/api/cities/stats/overview'),
};

function toQuery(params) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return '';
  const q = new URLSearchParams(entries).toString();
  return `?${q}`;
}

export default citiesApi; 