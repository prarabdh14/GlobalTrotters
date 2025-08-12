import { http } from './client';

export const emailApi = {
  // Send detailed itinerary email for a specific trip
  sendItineraryEmail: (tripId) => http.post(`/api/trips/${tripId}/send-itinerary`),
}; 