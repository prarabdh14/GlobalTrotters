import React, { useState } from 'react';
import RescheduleModal from './RescheduleModal';

const AIItineraryCard = ({ itinerary, onRescheduleSuccess }) => {
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getItinerarySummary = () => {
    if (itinerary.responseJson?.trip_summary) {
      return itinerary.responseJson.trip_summary;
    }
    return {
      route: `${itinerary.source} → ${itinerary.destination}`,
      duration_days: formatDuration(itinerary.startDate, itinerary.endDate),
      total_estimated_cost: 'N/A',
      currency: 'N/A'
    };
  };

  const summary = getItinerarySummary();

  const handleRescheduleSuccess = (rescheduledItinerary) => {
    if (onRescheduleSuccess) {
      onRescheduleSuccess(rescheduledItinerary);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {summary.route}
              </h3>
              <p className="text-sm text-gray-600">
                {formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowRescheduleModal(true)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                title="Reschedule this itinerary"
              >
                📅 Reschedule
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {summary.duration_days}
              </div>
              <div className="text-xs text-gray-500">Days</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {summary.currency} {summary.total_estimated_cost}
              </div>
              <div className="text-xs text-gray-500">Total Cost</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {itinerary.model?.split('/').pop() || 'AI'}
              </div>
              <div className="text-xs text-gray-500">Model</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-orange-600">
                {formatDate(itinerary.createdAt)}
              </div>
              <div className="text-xs text-gray-500">Created</div>
            </div>
          </div>

          {/* Daily Plan Preview */}
          {itinerary.responseJson?.daily_plan && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Daily Plan Preview</h4>
              <div className="space-y-2">
                {itinerary.responseJson.daily_plan.slice(0, 3).map((day, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    <span className="font-medium">Day {day.day}:</span> {day.city}
                    {day.morning?.length > 0 && (
                      <span className="ml-2 text-gray-500">
                        • {day.morning[0]}...
                      </span>
                    )}
                  </div>
                ))}
                {itinerary.responseJson.daily_plan.length > 3 && (
                  <div className="text-sm text-gray-500 italic">
                    +{itinerary.responseJson.daily_plan.length - 3} more days...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preferences */}
          {itinerary.preferences && Object.keys(itinerary.preferences).length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Preferences</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(itinerary.preferences).map(([key, value]) => (
                  <span
                    key={key}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                  >
                    {key}: {String(value)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Budget */}
          {itinerary.budget && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Budget Range</h4>
              <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                {itinerary.budget}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Cache Key: {itinerary.cacheKey.slice(0, 8)}...</span>
              <span>Last updated: {formatDate(itinerary.updatedAt || itinerary.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        itinerary={itinerary}
        onRescheduleSuccess={handleRescheduleSuccess}
      />
    </>
  );
};

export default AIItineraryCard;
