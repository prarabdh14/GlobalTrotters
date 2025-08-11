import { http } from './client';

export const tripsApi = {
  list: (params = {}) => http.get(`/api/trips${toQuery(params)}`),
  get: (id) => http.get(`/api/trips/${id}`),
  create: (payload) => http.post('/api/trips', payload),
  update: (id, payload) => http.put(`/api/trips/${id}`, payload),
  remove: (id) => http.del(`/api/trips/${id}`),

  addStop: (tripId, payload) => http.post(`/api/trips/${tripId}/stops`, payload),
  updateStop: (tripId, stopId, payload) => http.put(`/api/trips/${tripId}/stops/${stopId}`, payload),
  removeStop: (tripId, stopId) => http.del(`/api/trips/${tripId}/stops/${stopId}`),

  addActivity: (tripId, stopId, payload) => http.post(`/api/trips/${tripId}/stops/${stopId}/activities`, payload),
  updateActivity: (tripId, activityId, payload) => http.put(`/api/trips/${tripId}/activities/${activityId}`, payload),
  removeActivity: (tripId, activityId) => http.del(`/api/trips/${tripId}/activities/${activityId}`),
};

function toQuery(params) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return '';
  const q = new URLSearchParams(entries).toString();
  return `?${q}`;
}

export default tripsApi; 