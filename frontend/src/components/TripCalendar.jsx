import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, MapPin, Clock, Users, Plus, ExternalLink, Globe } from 'lucide-react';
import { tripsApi } from '../api/trips';
import { calendarApi } from '../api/calendar';
import VantaGlobe from './VantaGlobe';

const TripCalendar = () => {
  const [trips, setTrips] = useState([]);
  const [tripsLoaded, setTripsLoaded] = useState(false);
  const [googleEvents, setGoogleEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [showGoogleCalendar, setShowGoogleCalendar] = useState(false);

  useEffect(() => {
    const initializeCalendar = async () => {
      try {
        await fetchTrips();
        await checkGoogleConnection();
      } catch (err) {
        console.error('Error initializing calendar:', err);
        setError('Failed to load calendar data. Please try refreshing the page.');
      }
    };

    initializeCalendar();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await tripsApi.list();
      // Handle both array and object responses
      const tripsData = Array.isArray(response) ? response : (response.trips || response.data || []);
      console.log('Trips data:', tripsData);
      setTrips(tripsData);
      setTripsLoaded(true);
    } catch (err) {
      setError('Failed to load trips');
      console.error('Error fetching trips:', err);
      setTrips([]); // Set empty array on error
      setTripsLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const checkGoogleConnection = async () => {
    try {
      const status = await calendarApi.getStatus();
      setIsGoogleConnected(status.isConnected);
      
      if (status.isConnected && !status.needsReauth) {
        fetchGoogleEvents();
        setShowGoogleCalendar(true); // Show Google Calendar when connected
      }
    } catch (err) {
      console.error('Error checking Google connection:', err);
      setIsGoogleConnected(false);
      // Don't set error here as it's not critical for the main functionality
    }
  };

  const fetchGoogleEvents = async () => {
    try {
      const response = await calendarApi.getEvents();
      setGoogleEvents(response.events || []);
    } catch (err) {
      console.error('Error fetching Google events:', err);
      // Don't set error here as it's not critical for the main functionality
    }
  };

  const connectGoogleCalendar = async () => {
    try {
      setIsConnectingGoogle(true);
      const response = await calendarApi.getAuthUrl();
      window.location.href = response.authUrl;
    } catch (err) {
      setError('Failed to connect Google Calendar');
      setIsConnectingGoogle(false);
    }
  };

  const addTripToGoogleCalendar = async (tripId) => {
    try {
      await calendarApi.addTripToCalendar(tripId);
      alert('Trip added to Google Calendar successfully!');
    } catch (err) {
      setError('Failed to add trip to Google Calendar');
    }
  };

  const getGoogleCalendarUrl = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    return `https://calendar.google.com/calendar/embed?src=primary&ctz=local&mode=MONTH&year=${currentYear}&month=${currentMonth}`;
  };

  const toggleCalendarView = () => {
    setShowGoogleCalendar(!showGoogleCalendar);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getTripsForDate = (date) => {
    if (!date || !Array.isArray(trips)) {
      console.log('getTripsForDate: trips is not an array:', trips);
      return [];
    }
    
    const dateStr = date.toISOString().split('T')[0];
    console.log('getTripsForDate: filtering trips for date:', dateStr, 'Total trips:', trips.length);
    return trips.filter(trip => {
      const startDate = new Date(trip.start_date).toISOString().split('T')[0];
      const endDate = new Date(trip.end_date).toISOString().split('T')[0];
      return dateStr >= startDate && dateStr <= endDate;
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getDayName = (dayIndex) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  };

  if (loading || !tripsLoaded) {
    return (
      <VantaGlobe>
        <div className="container py-8 relative z-10">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Calendar size={48} className="text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading calendar...</p>
            </div>
          </div>
        </div>
      </VantaGlobe>
    );
  }

  if (error) {
    return (
      <VantaGlobe>
        <div className="container py-8 relative z-10">
          <div className="card bg-red-50 border-red-200">
            <div className="text-red-800">
              <h4 className="font-semibold">Error</h4>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </VantaGlobe>
    );
  }

  const days = getDaysInMonth(currentDate);

  return (
    <VantaGlobe>
      <div className="container py-8 relative z-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="text-blue-400" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-white">Trip Calendar</h1>
            <p className="text-white/80">View your trips in a calendar format</p>
          </div>
        </div>
      </div>

      {/* Google Calendar Connection */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Google Calendar Integration</h3>
            <p className="text-sm text-gray-600">
              {isGoogleConnected 
                ? 'Connected to Google Calendar' 
                : 'Connect your Google Calendar to sync trips and view events'
              }
            </p>
          </div>
          <div className="flex gap-2">
            {isGoogleConnected ? (
              <>
                <button
                  onClick={toggleCalendarView}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  {showGoogleCalendar ? (
                    <>
                      <Calendar size={16} className="inline mr-2" />
                      Show App Calendar
                    </>
                  ) : (
                    <>
                      <Globe size={16} className="inline mr-2" />
                      Show Google Calendar
                    </>
                  )}
                </button>
                <button
                  onClick={() => fetchGoogleEvents()}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <ExternalLink size={16} className="inline mr-2" />
                  Refresh Events
                </button>
              </>
            ) : (
              <button
                onClick={connectGoogleCalendar}
                disabled={isConnectingGoogle}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isConnectingGoogle ? (
                  <>
                    <div className="loading-spinner w-4 h-4 inline mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Plus size={16} className="inline mr-2" />
                    Connect Calendar
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {showGoogleCalendar && isGoogleConnected ? (
        /* Google Calendar View */
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Google Calendar</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleCalendarView}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
              >
                <Calendar size={14} className="inline mr-1" />
                Switch to App Calendar
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg overflow-hidden" style={{ height: '600px' }}>
            <iframe
              src={getGoogleCalendarUrl()}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Google Calendar"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar View */}
          <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Calendar</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-medium min-w-[120px] text-center">
                {getMonthName(currentDate)}
              </span>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="p-2 text-center text-sm font-medium text-gray-600">
                {getDayName(i)}
              </div>
            ))}
            
            {/* Calendar Days */}
            {days.map((date, index) => {
              const tripsForDate = getTripsForDate(date);
              const hasTrips = tripsForDate.length > 0;
              
              return (
                <div
                  key={index}
                  onClick={() => date && setSelectedDate(date)}
                  className={`
                    min-h-[80px] p-2 border border-gray-200 cursor-pointer transition-colors
                    ${!date ? 'bg-gray-50' : ''}
                    ${date && isToday(date) ? 'bg-blue-50 border-blue-300' : ''}
                    ${date && isSelected(date) ? 'bg-blue-100 border-blue-400' : ''}
                    ${date && hasTrips ? 'bg-green-50 border-green-300' : ''}
                    hover:bg-gray-50
                  `}
                >
                  {date && (
                    <>
                      <div className="text-sm font-medium mb-1">
                        {date.getDate()}
                      </div>
                      {hasTrips && (
                        <div className="space-y-1">
                          {tripsForDate.slice(0, 2).map((trip, tripIndex) => (
                            <div
                              key={tripIndex}
                              className="text-xs bg-green-500 text-white px-1 py-0.5 rounded truncate"
                              title={trip.title}
                            >
                              {trip.title}
                            </div>
                          ))}
                          {tripsForDate.length > 2 && (
                            <div className="text-xs text-green-600 font-medium">
                              +{tripsForDate.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">
            {selectedDate ? `Trips on ${formatDate(selectedDate)}` : 'Select a date'}
          </h2>
          
          {selectedDate ? (
            <div className="space-y-4">
              {getTripsForDate(selectedDate).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No trips scheduled for this date</p>
                </div>
              ) : (
                getTripsForDate(selectedDate).map((trip) => (
                  <div key={trip.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{trip.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                        trip.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {trip.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{trip.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span>
                          {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {trip.budget && (
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-gray-400" />
                          <span>Budget: ₹{trip.budget}</span>
                        </div>
                      )}
                    </div>
                    
                    {trip.tripStops && trip.tripStops.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <h4 className="font-medium text-sm mb-2">Stops:</h4>
                        <div className="space-y-1">
                          {trip.tripStops.map((stop, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              <MapPin size={12} className="text-gray-400" />
                              <span>{stop.city}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Click on a date to view trip details</p>
            </div>
          )}
        </div>
      </div>
      )}
      </div>
    </VantaGlobe>
  );
};

export default TripCalendar;
