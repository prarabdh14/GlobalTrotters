import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin, 
  AlertTriangle, 
  CheckCircle,
  X,
  CalendarDays
} from 'lucide-react';
import { rescheduleApi } from '../api/reschedule';

const RescheduleModal = ({ trip, isOpen, onClose, onRescheduleSuccess }) => {
  const [rescheduleData, setRescheduleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDates, setSelectedDates] = useState({
    startDate: '',
    endDate: ''
  });
  const [reason, setReason] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    console.log('RescheduleModal useEffect:', { isOpen, trip });
    if (isOpen && trip) {
      console.log('Checking reschedule availability for trip:', trip);
      checkRescheduleAvailability();
    }
  }, [isOpen, trip]);

  const checkRescheduleAvailability = async () => {
    try {
      setLoading(true);
      const data = await rescheduleApi.checkReschedule(trip.id);
      setRescheduleData(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to check reschedule availability');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedDates.startDate || !selectedDates.endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (new Date(selectedDates.startDate) >= new Date(selectedDates.endDate)) {
      setError('End date must be after start date');
      return;
    }

    try {
      setLoading(true);
      const response = await rescheduleApi.rescheduleTrip({
        tripId: trip.id,
        newStartDate: selectedDates.startDate,
        newEndDate: selectedDates.endDate,
        reason
      });

      onRescheduleSuccess(response);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reschedule trip');
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today;
      const isSelected = date.toDateString() === new Date(selectedDates.startDate).toDateString() ||
                        date.toDateString() === new Date(selectedDates.endDate).toDateString();
      const isInRange = selectedDates.startDate && selectedDates.endDate &&
                       date >= new Date(selectedDates.startDate) && 
                       date <= new Date(selectedDates.endDate);

      days.push({
        date,
        isCurrentMonth,
        isToday,
        isPast,
        isSelected,
        isInRange
      });
    }

    return days;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  console.log('RescheduleModal render:', { isOpen, trip })
  
  // Simple test to ensure modal shows
  if (!isOpen) {
    console.log('Modal not open, returning null')
    return null;
  }
  
  console.log('Modal should be visible now')

    return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="card max-w-5xl w-full max-h-[90vh] overflow-hidden">
                  {/* Header */}
        <div className="relative mb-6 overflow-hidden rounded-2xl">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 h-32"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 backdrop-blur-sm"
          >
            <X size={20} className="text-white" />
          </button>
          
          {/* Header Content */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Calendar className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Reschedule Trip</h2>
                <p className="text-white/80 text-sm">{trip?.name}</p>
              </div>
            </div>
          </div>
        </div>

        {loading && !rescheduleData ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Checking Availability</h3>
            <p className="text-gray-600">Verifying if your trip can be rescheduled...</p>
          </div>
        ) : error ? (
          <div className="p-8">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center gap-3 text-red-600 mb-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle size={20} />
                </div>
                <span className="font-semibold text-lg">Error</span>
              </div>
              <p className="text-red-700 text-lg">{error}</p>
            </div>
          </div>
        ) : rescheduleData ? (
          <div className="space-y-6">
            {/* Reschedule Status */}
            <div className={`p-4 rounded-xl border ${
              rescheduleData.canReschedule 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  rescheduleData.canReschedule ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {rescheduleData.canReschedule ? (
                    <CheckCircle className="text-green-400" size={18} />
                  ) : (
                    <AlertTriangle className="text-red-400" size={18} />
                  )}
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${
                    rescheduleData.canReschedule ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {rescheduleData.canReschedule 
                      ? '✅ Trip Can Be Rescheduled' 
                      : '❌ Cannot Reschedule Trip'
                    }
                  </h3>
                  <p className={`text-sm ${
                    rescheduleData.canReschedule ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {rescheduleData.canReschedule 
                      ? `${rescheduleData.hoursUntilTrip} hours until trip starts`
                      : 'Trip starts within 24 hours'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Current Trip Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} className="text-green-500" />
                <span className="text-sm font-medium">
                  {formatDate(rescheduleData.trip.startDate)} - {formatDate(rescheduleData.trip.endDate)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} className="text-blue-500" />
                <span className="text-sm font-medium">{rescheduleData.trip.stops.length} stops</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign size={16} className="text-orange-500" />
                <span className="text-sm font-medium">
                  Used: {formatCurrency(rescheduleData.usedBudget)} | Total: {formatCurrency(rescheduleData.totalBudget)}
                </span>
              </div>
            </div>

            {rescheduleData.canReschedule && (
              <>
                {/* Calendar */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-600">Select New Dates</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <span className="text-gray-600 font-bold">‹</span>
                      </button>
                      <span className="font-medium text-gray-700 px-3">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <span className="text-gray-600 font-bold">›</span>
                      </button>
                    </div>
                  </div>

                                    {/* Calendar Grid */}
                  <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
                    {/* Calendar Header */}
                    <div className="bg-gray-100 border-b border-gray-300 px-4 py-3">
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-800">
                          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                      </div>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b border-gray-300">
                      {['SUN', 'MON', 'TUES', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                        <div key={day} className="text-center py-3 px-2 border-r border-gray-300 last:border-r-0">
                          <span className="text-xs font-bold text-gray-700">{day}</span>
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days Grid */}
                    <div className="grid grid-cols-7">
                      {generateCalendarDays().map((day, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (!day.isPast && day.isCurrentMonth) {
                              if (!selectedDates.startDate || (selectedDates.startDate && selectedDates.endDate)) {
                                setSelectedDates({
                                  startDate: day.date.toISOString().split('T')[0],
                                  endDate: ''
                                });
                              } else {
                                setSelectedDates(prev => ({
                                  ...prev,
                                  endDate: day.date.toISOString().split('T')[0]
                                }));
                              }
                            }
                          }}
                          disabled={day.isPast || !day.isCurrentMonth}
                          className={`
                            min-h-[60px] p-2 text-sm font-medium border-r border-b border-gray-300 last:border-r-0 flex flex-col items-center justify-start
                            ${day.isPast || !day.isCurrentMonth 
                              ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
                              : 'hover:bg-blue-50 cursor-pointer text-gray-800'
                            }
                            ${day.isToday ? 'bg-blue-100 text-blue-800 font-bold' : ''}
                            ${day.isSelected ? 'bg-purple-100 text-purple-800 font-bold' : ''}
                            ${day.isInRange && !day.isSelected ? 'bg-purple-50 text-purple-700' : ''}
                            ${!day.isCurrentMonth ? 'text-gray-300 bg-gray-50' : ''}
                          `}
                        >
                          <span className="text-base font-semibold">{day.date.getDate()}</span>
                          {day.isToday && (
                            <span className="text-xs text-blue-600 mt-1">Today</span>
                          )}
                          {day.isSelected && (
                            <span className="text-xs text-purple-600 mt-1">Selected</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Reason for Rescheduling (Optional)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Tell us why you're rescheduling this trip..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {/* Selected Dates Summary */}
                {selectedDates.startDate && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-lg font-bold text-green-800 mb-3">New Trip Dates</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          Start: {formatDate(selectedDates.startDate)}
                        </span>
                      </div>
                      {selectedDates.endDate && (
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-green-600" />
                          <span className="text-sm font-medium text-green-700">
                            End: {formatDate(selectedDates.endDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={onClose}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg transition-all duration-200 font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReschedule}
                    disabled={!selectedDates.startDate || !selectedDates.endDate || loading}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/90 hover:bg-white text-orange-600 border border-orange-500/30 rounded-lg transition-all duration-200 font-medium text-sm hover:border-orange-400 hover:text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-600 border-t-transparent"></div>
                        Rescheduling...
                      </div>
                    ) : (
                      <>
                        <Clock size={14} />
                        <span className="whitespace-nowrap">Reschedule Trip</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RescheduleModal; 