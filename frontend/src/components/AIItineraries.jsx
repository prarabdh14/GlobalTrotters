import React, { useState, useEffect } from 'react';
import { aiAPI } from '../api/ai';
import AIItineraryCard from './AIItineraryCard';

const AIItineraries = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadItineraries();
  }, []);

  const loadItineraries = async () => {
    try {
      setLoading(true);
      const data = await aiAPI.getUserItineraries();
      setItineraries(data);
    } catch (err) {
      setError('Failed to load itineraries');
      console.error('Error loading itineraries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadItineraries();
      return;
    }

    try {
      setLoading(true);
      const data = await aiAPI.searchItineraries(searchQuery);
      setItineraries(data.results);
    } catch (err) {
      setError('Search failed');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleSuccess = (rescheduledItinerary) => {
    // Add the new rescheduled itinerary to the list
    setItineraries(prev => [rescheduledItinerary, ...prev]);
    
    // Show success message
    alert(`Itinerary successfully rescheduled to ${new Date(rescheduledItinerary.startDate).toLocaleDateString()} - ${new Date(rescheduledItinerary.endDate).toLocaleDateString()}`);
  };

  const filteredItineraries = itineraries.filter(itinerary => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      itinerary.source.toLowerCase().includes(query) ||
      itinerary.destination.toLowerCase().includes(query) ||
      (itinerary.responseText && itinerary.responseText.toLowerCase().includes(query))
    );
  });

  if (loading && itineraries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your AI itineraries...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI-Generated Itineraries
          </h1>
          <p className="text-gray-600">
            View and manage your AI-powered travel plans. Click the reschedule button to modify dates.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search itineraries by source, destination, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  loadItineraries();
                }}
                className="px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Itineraries Grid */}
        {filteredItineraries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">✈️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No itineraries found' : 'No AI itineraries yet'}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? 'Try adjusting your search terms or create a new itinerary.'
                : 'Create your first AI-powered travel itinerary to get started!'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItineraries.map((itinerary) => (
              <AIItineraryCard
                key={itinerary.cacheKey}
                itinerary={itinerary}
                onRescheduleSuccess={handleRescheduleSuccess}
              />
            ))}
          </div>
        )}

        {/* Loading State for Search */}
        {loading && itineraries.length > 0 && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Searching...</p>
          </div>
        )}

        {/* Stats */}
        {itineraries.length > 0 && (
          <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{itineraries.length}</div>
                <div className="text-sm text-gray-500">Total Itineraries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {itineraries.filter(i => i.responseJson).length}
                </div>
                <div className="text-sm text-gray-500">Successfully Generated</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(itineraries.map(i => i.destination)).size}
                </div>
                <div className="text-sm text-gray-500">Unique Destinations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {new Date(Math.max(...itineraries.map(i => new Date(i.createdAt)))).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-500">Latest Created</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIItineraries;
