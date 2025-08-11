import React, { useState, useEffect } from 'react';
import { aiAPI } from '../api/ai';

const RescheduleModal = ({ isOpen, onClose, itinerary, onRescheduleSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState(null);
  const [selectedDates, setSelectedDates] = useState({
    start_date: '',
    end_date: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && itinerary?.cacheKey) {
      loadRescheduleOptions();
    }
  }, [isOpen, itinerary]);

  const loadRescheduleOptions = async () => {
    try {
      setLoading(true);
      const data = await aiAPI.getRescheduleOptions(itinerary.cacheKey);
      setOptions(data);
      
      // Set default dates to original dates
      setSelectedDates({
        start_date: data.original.start_date.slice(0, 10),
        end_date: data.original.end_date.slice(0, 10)
      });
    } catch (err) {
      setError('Failed to load reschedule options');
      console.error('Error loading reschedule options:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setSelectedDates(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSuggestionClick = (suggestion) => {
    setSelectedDates({
      start_date: suggestion.start_date,
      end_date: suggestion.end_date
    });
  };

  const handleReschedule = async () => {
    if (!selectedDates.start_date || !selectedDates.end_date) {
      setError('Please select both start and end dates');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const rescheduled = await aiAPI.rescheduleItinerary({
        original_cache_key: itinerary.cacheKey,
        new_start_date: selectedDates.start_date,
        new_end_date: selectedDates.end_date
      });

      onRescheduleSuccess(rescheduled);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reschedule itinerary');
      console.error('Error rescheduling:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Reschedule Itinerary
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {itinerary && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Current Itinerary</h3>
            <p className="text-blue-700">
              <strong>Route:</strong> {itinerary.source} → {itinerary.destination}
            </p>
            <p className="text-blue-700">
              <strong>Current Dates:</strong> {formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}
            </p>
          </div>
        )}

        {loading && !options ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading reschedule options...</p>
          </div>
        ) : options ? (
          <>
            {/* Suggested Dates */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Quick Suggestions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {options.suggested_dates.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-gray-800">{suggestion.description}</div>
                    <div className="text-sm text-gray-600">
                      {formatDate(suggestion.start_date)} - {formatDate(suggestion.end_date)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Selection */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Custom Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={selectedDates.start_date}
                    onChange={(e) => handleDateChange('start_date', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={selectedDates.end_date}
                    onChange={(e) => handleDateChange('end_date', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Existing Rescheduled Versions */}
            {options.rescheduled_versions.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Previous Reschedules</h3>
                <div className="space-y-2">
                  {options.rescheduled_versions.map((version, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">
                        {formatDate(version.start_date)} - {formatDate(version.end_date)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Created: {formatDate(version.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={loading || !selectedDates.start_date || !selectedDates.end_date}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Rescheduling...' : 'Reschedule'}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default RescheduleModal;
