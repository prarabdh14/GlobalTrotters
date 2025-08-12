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
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
                  {/* Header */}
        <div className="relative mb-6 overflow-hidden rounded-2xl">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 h-32"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/25 hover:bg-white/35 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
          >
            <X size={20} className="text-white" />
          </button>
          
          {/* Header Content */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white/25 rounded-xl backdrop-blur-sm border border-white/20">
                <Calendar className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">Reschedule Trip</h2>
                <p className="text-white/90 text-base font-medium">{trip?.name}</p>
              </div>
            </div>
          </div>
        </div>

        {loading && !rescheduleData ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
            <h3 className="text-2xl font-bold text-white mb-3">Checking Availability</h3>
            <p className="text-white/70 text-lg">Verifying if your trip can be rescheduled...</p>
          </div>
        ) : error ? (
          <div className="p-8">
            <div className="bg-gradient-to-r from-red-500/15 to-pink-600/15 border border-red-500/40 rounded-2xl p-8 backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-4 text-red-400 mb-4">
                <div className="p-3 bg-red-500/25 rounded-xl border border-red-500/30">
                  <AlertTriangle size={24} />
                </div>
                <span className="font-bold text-xl">Error</span>
              </div>
              <p className="text-red-200 text-lg leading-relaxed">{error}</p>
            </div>
          </div>
        ) : rescheduleData ? (
          <div className="space-y-6">
            {/* Reschedule Status */}
            <div className={`p-6 rounded-2xl border-2 backdrop-blur-md shadow-lg ${
              rescheduleData.canReschedule 
                ? 'bg-gradient-to-r from-emerald-500/15 to-green-600/15 border-emerald-500/40' 
                : 'bg-gradient-to-r from-red-500/15 to-pink-600/15 border-red-500/40'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl border ${
                  rescheduleData.canReschedule ? 'bg-emerald-500/25 border-emerald-500/40' : 'bg-red-500/25 border-red-500/40'
                }`}>
                  {rescheduleData.canReschedule ? (
                    <CheckCircle className="text-emerald-400" size={24} />
                  ) : (
                    <AlertTriangle className="text-red-400" size={24} />
                  )}
                </div>
                <div>
                  <h3 className={`text-xl font-bold mb-2 ${
                    rescheduleData.canReschedule ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {rescheduleData.canReschedule 
                      ? '✅ Trip Can Be Rescheduled' 
                      : '❌ Cannot Reschedule Trip'
                    }
                  </h3>
                  <p className={`text-base ${
                    rescheduleData.canReschedule ? 'text-emerald-300' : 'text-red-300'
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
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-md shadow-lg">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-indigo-400" />
                Current Trip Details
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white/90">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Calendar size={18} className="text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-sm text-white/70">Trip Dates</span>
                    <p className="text-base font-medium text-white">
                      {formatDate(rescheduleData.trip.startDate)} - {formatDate(rescheduleData.trip.endDate)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-white/90">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <MapPin size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <span className="text-sm text-white/70">Destinations</span>
                    <p className="text-base font-medium text-white">{rescheduleData.trip.stops.length} stops</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-white/90">
                  <div className="p-2 bg-pink-500/20 rounded-lg">
                    <DollarSign size={18} className="text-pink-400" />
                  </div>
                  <div>
                    <span className="text-sm text-white/70">Budget</span>
                    <p className="text-base font-medium text-white">
                      Used: {formatCurrency(rescheduleData.usedBudget)} | Total: {formatCurrency(rescheduleData.totalBudget)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {rescheduleData.canReschedule && (
              <>
                {/* Calendar */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <CalendarDays size={24} className="text-indigo-400" />
                      Select New Dates
                    </h3>
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2">
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
                      >
                        <span className="text-white font-bold text-lg">‹</span>
                      </button>
                      <span className="font-bold text-white px-4 text-lg">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
                      >
                        <span className="text-white font-bold text-lg">›</span>
                      </button>
                    </div>
                  </div>

                                    {/* Calendar Grid */}
                  <div className="bg-gradient-to-br from-indigo-500/15 to-purple-500/15 backdrop-blur-md border-2 border-indigo-500/30 rounded-2xl shadow-2xl shadow-black/20">
                    {/* Calendar Header */}
                    <div className="bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border-b-2 border-indigo-500/40 px-6 py-4">
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-white">
                          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                      </div>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b-2 border-indigo-500/40">
                      {['SUN', 'MON', 'TUES', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                        <div key={day} className="text-center py-4 px-2 border-r border-indigo-500/30 last:border-r-0">
                          <span className="text-sm font-bold text-black-200">{day}</span>
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
                            min-h-[70px] p-3 text-sm font-medium border-r border-b border-indigo-500/20 last:border-r-0 flex flex-col items-center justify-start transition-all duration-200
                            ${day.isPast || !day.isCurrentMonth 
                              ? 'text-white/30 cursor-not-allowed bg-white/5' 
                              : 'hover:bg-indigo-500/30 hover:scale-105 cursor-pointer text-white/90'
                            }
                            ${day.isToday ? 'bg-gradient-to-br from-indigo-500/40 to-purple-500/40 text-white font-bold shadow-lg' : ''}
                            ${day.isSelected ? 'bg-gradient-to-br from-purple-500/40 to-pink-500/40 text-white font-bold shadow-lg' : ''}
                            ${day.isInRange && !day.isSelected ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-white/90' : ''}
                            ${!day.isCurrentMonth ? 'text-white/20 bg-white/5' : ''}
                          `}
                        >
                          <span className="text-lg font-bold">{day.date.getDate()}</span>
                          {day.isToday && (
                            <span className="text-xs text-indigo-200 mt-1 font-semibold">Today</span>
                          )}
                          {day.isSelected && (
                            <span className="text-xs text-purple-200 mt-1 font-semibold">Selected</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Reason */}
                <div className="space-y-3">
                  <label className="block text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">💭</span>
                    Reason for Rescheduling (Optional)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Tell us why you're rescheduling this trip..."
                    className="w-full p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-md border-2 border-indigo-500/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-white placeholder:text-white/50 text-base"
                    rows={4}
                  />
                </div>

                {/* Selected Dates Summary */}
                {selectedDates.startDate && (
                  <div className="p-6 bg-gradient-to-r from-emerald-500/15 to-green-600/15 border-2 border-emerald-500/40 rounded-2xl backdrop-blur-md shadow-lg">
                    <h4 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      New Trip Dates Selected
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                        <Calendar size={20} className="text-emerald-400" />
                        <div>
                          <span className="text-sm text-emerald-300">Start Date</span>
                          <p className="text-base font-bold text-emerald-200">{formatDate(selectedDates.startDate)}</p>
                        </div>
                      </div>
                      {selectedDates.endDate && (
                        <div className="flex items-center gap-3 p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                          <Calendar size={20} className="text-emerald-400" />
                          <div>
                            <span className="text-sm text-emerald-300">End Date</span>
                            <p className="text-base font-bold text-emerald-200">{formatDate(selectedDates.endDate)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={onClose}
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-gray-500/20 to-gray-600/20 hover:from-gray-500/30 hover:to-gray-600/30 text-white border-2 border-gray-500/40 rounded-xl transition-all duration-200 font-bold text-base hover:border-gray-400 hover:scale-105 shadow-lg"
                  >
                    <span className="text-xl">❌</span>
                    Cancel
                  </button>
                  <button
                    onClick={handleReschedule}
                    disabled={!selectedDates.startDate || !selectedDates.endDate || loading}
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 text-white border-2 border-indigo-500/40 rounded-xl transition-all duration-200 font-bold text-base hover:border-indigo-400 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Rescheduling...</span>
                      </div>
                    ) : (
                      <>
                        <Clock size={18} />
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