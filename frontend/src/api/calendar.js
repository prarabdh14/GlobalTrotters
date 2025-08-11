import { http } from './client';

export const calendarApi = {
  // Get Google Calendar authorization URL
  getAuthUrl: () => http.get('/api/calendar/auth-url'),

  // Handle OAuth callback
  handleCallback: (code) => http.get(`/api/calendar/callback?code=${code}`),

  // Check Google Calendar connection status
  getStatus: () => http.get('/api/calendar/status'),

  // Add trip to Google Calendar
  addTripToCalendar: (tripId) => http.post('/api/calendar/add-trip', { tripId }),

  // Get user's Google Calendar events
  getEvents: () => http.get('/api/calendar/events'),
}; 