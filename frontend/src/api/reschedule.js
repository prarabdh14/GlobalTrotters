import { http } from './client';

export const rescheduleApi = {
  // Check if trip can be rescheduled
  checkReschedule: (tripId) => http.get(`/api/reschedule/check/${tripId}`),

  // Reschedule a trip
  rescheduleTrip: (data) => http.post('/api/reschedule/trip', data),

  // Get reschedule history
  getHistory: (tripId) => http.get(`/api/reschedule/history/${tripId}`),
}; 