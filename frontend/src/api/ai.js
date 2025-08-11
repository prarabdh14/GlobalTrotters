import { http } from './client';

export const aiApi = {
  // Generate AI itinerary
  plan: (payload) => http.post('/api/ai/plan', payload),

  // Search cached itineraries
  search: (params = {}) => http.get(`/api/ai/search${toQuery(params)}`),

  // Get user's AI itineraries
  getUserItineraries: () => http.get('/api/ai/user'),
};

// Helper function to convert params object to query string
function toQuery(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
} 