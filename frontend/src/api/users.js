import { http } from './client';

export const usersApi = {
  profile: () => http.get('/api/users/profile'),
  updateProfile: (payload) => http.put('/api/users/profile', payload),
  stats: (params = {}) => http.get(`/api/users/stats${toQuery(params)}`),
  travelHistory: (params = {}) => http.get(`/api/users/travel-history${toQuery(params)}`),
  favoriteDestinations: () => http.get('/api/users/favorite-destinations'),
  travelTimeline: (params = {}) => http.get(`/api/users/travel-timeline${toQuery(params)}`),
  deleteAccount: () => http.del('/api/users/account'),
};

function toQuery(params) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return '';
  const q = new URLSearchParams(entries).toString();
  return `?${q}`;
}

export default usersApi; 