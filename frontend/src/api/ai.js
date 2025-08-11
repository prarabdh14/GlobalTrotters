import { http } from './client';

export const aiAPI = {
  // Plan a new itinerary
  planItinerary: async (data) => {
    const response = await http.post('/api/ai/plan', data);
    return response;
  },

  // Get reschedule options for an existing itinerary
  getRescheduleOptions: async (cacheKey) => {
    const response = await http.get(`/api/ai/reschedule-options/${cacheKey}`);
    return response;
  },

  // Reschedule an existing itinerary
  rescheduleItinerary: async (data) => {
    const response = await http.post('/api/ai/reschedule', data);
    return response;
  },

  // Search cached itineraries
  searchItineraries: async (query, limit = 20, offset = 0) => {
    const response = await http.get(`/api/ai/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`);
    return response;
  },

  // Get user's AI itineraries
  getUserItineraries: async () => {
    const response = await http.get('/api/ai/user');
    return response;
  }
}; 