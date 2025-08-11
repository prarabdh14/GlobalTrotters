import React, { useState } from 'react';
import { MapPin, Calendar, DollarSign, Users, Sparkles, Loader2, Search, RefreshCw, Save, Check } from 'lucide-react';
import { aiApi } from '../api/ai';
import { tripsApi } from '../api/trips';

const AiItineraryGenerator = () => {
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    start_date: '',
    end_date: '',
    budget: '',
    preferences: {
      interests: [],
      travelStyle: 'balanced',
      accommodation: 'any',
      transport: 'any'
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const interests = [
    'Museums & Culture', 'Nature & Outdoors', 'Food & Dining', 
    'Shopping', 'Adventure Sports', 'Relaxation', 'History', 
    'Art & Architecture', 'Nightlife', 'Family Activities'
  ];

  const travelStyles = [
    { value: 'budget', label: 'Budget-Friendly' },
    { value: 'balanced', label: 'Balanced' },
    { value: 'luxury', label: 'Luxury' }
  ];

  const accommodationTypes = [
    { value: 'any', label: 'Any' },
    { value: 'hostel', label: 'Hostel' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'resort', label: 'Resort' }
  ];

  const transportTypes = [
    { value: 'any', label: 'Any' },
    { value: 'public', label: 'Public Transport' },
    { value: 'walking', label: 'Walking' },
    { value: 'taxi', label: 'Taxi/Rideshare' },
    { value: 'rental', label: 'Car Rental' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: value
      }
    }));
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        interests: prev.preferences.interests.includes(interest)
          ? prev.preferences.interests.filter(i => i !== interest)
          : [...prev.preferences.interests, interest]
      }
    }));
  };

  const handleGenerateItinerary = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setItinerary(null);

    try {
      const payload = {
        source: formData.source,
        destination: formData.destination,
        start_date: formData.start_date,
        end_date: formData.end_date,
        budget: formData.budget || undefined,
        preferences: formData.preferences
      };

      const result = await aiApi.plan(payload);
      setItinerary(result);
    } catch (err) {
      setError(err.message || 'Failed to generate itinerary');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const result = await aiApi.search({ q: searchQuery, limit: 10 });
      setSearchResults(result.results || []);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRefresh = async () => {
    if (!itinerary) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      const payload = {
        source: formData.source,
        destination: formData.destination,
        start_date: formData.start_date,
        end_date: formData.end_date,
        budget: formData.budget || undefined,
        preferences: formData.preferences,
        force_refresh: true
      };

      const result = await aiApi.plan(payload);
      setItinerary(result);
    } catch (err) {
      setError(err.message || 'Failed to regenerate itinerary');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToMyTrips = async () => {
    if (!itinerary || !itinerary.responseJson) return;
    
    setIsSaving(true);
    setSavedSuccess(false);
    
    try {
      const tripData = {
        name: `${itinerary.source} to ${itinerary.destination}`,
        description: `AI-generated itinerary for ${itinerary.responseJson.trip_summary.route}`,
        startDate: itinerary.startDate,
        endDate: itinerary.endDate,
        coverImg: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&h=200&fit=crop'
      };

      // Create the trip
      const response = await tripsApi.create(tripData);
      const newTrip = response.trip; // The backend returns { message, trip }
      
      // For now, we'll just create the trip without stops
      // The AI itinerary data is stored in the responseJson field
      console.log('Trip created successfully:', newTrip);

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving to MyTrips:', error);
      setError('Failed to save itinerary to MyTrips');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-blue-500" size={32} />
          <div>
            <h1 className="text-3xl font-bold">AI Itinerary Generator</h1>
            <p className="text-gray-600">Get personalized travel plans powered by AI</p>
          </div>
        </div>
      </div>

      <div className="grid grid-1 lg:grid-2 gap-8">
        {/* Form Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Plan Your Trip</h2>
          
          <form onSubmit={handleGenerateItinerary} className="space-y-6">
            {/* Basic Details */}
            <div className="grid grid-2 gap-4">
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <MapPin size={16} className="text-blue-600" />
                  From
                </label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., New York"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <MapPin size={16} className="text-blue-600" />
                  To
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., Paris"
                  required
                />
              </div>
            </div>

            <div className="grid grid-2 gap-4">
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <Calendar size={16} className="text-blue-600" />
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <Calendar size={16} className="text-blue-600" />
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <DollarSign size={16} className="text-blue-600" />
                Budget (Optional)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., 5000"
                min="0"
              />
            </div>

            {/* Travel Style */}
            <div className="form-group">
              <label className="form-label">Travel Style</label>
              <div className="grid grid-3 gap-3">
                {travelStyles.map(style => (
                  <label key={style.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="travelStyle"
                      value={style.value}
                      checked={formData.preferences.travelStyle === style.value}
                      onChange={(e) => handlePreferenceChange('travelStyle', e.target.value)}
                      className="text-blue-600"
                    />
                    <span className="text-sm">{style.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Accommodation Preference */}
            <div className="form-group">
              <label className="form-label">Accommodation Preference</label>
              <select
                value={formData.preferences.accommodation}
                onChange={(e) => handlePreferenceChange('accommodation', e.target.value)}
                className="form-input"
              >
                {accommodationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Transport Preference */}
            <div className="form-group">
              <label className="form-label">Transport Preference</label>
              <select
                value={formData.preferences.transport}
                onChange={(e) => handlePreferenceChange('transport', e.target.value)}
                className="form-input"
              >
                {transportTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Interests */}
            <div className="form-group">
              <label className="form-label">Interests (Select all that apply)</label>
              <div className="grid grid-2 gap-2">
                {interests.map(interest => (
                  <label key={interest} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.preferences.interests.includes(interest)}
                      onChange={() => handleInterestToggle(interest)}
                      className="text-blue-600"
                    />
                    <span className="text-sm">{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="btn btn-primary w-full"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Generating Itinerary...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles size={20} />
                  Generate AI Itinerary
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Search Section */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Search Previous Itineraries</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by destination or keywords..."
                className="form-input flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="btn btn-secondary"
              >
                {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              </button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((result, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{result.source} → {result.destination}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(result.startDate).toLocaleDateString()} - {new Date(result.endDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Generated Itinerary */}
          {itinerary && (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Generated Itinerary</h3>
                <button
                  onClick={handleRefresh}
                  disabled={isGenerating}
                  className="btn btn-outline btn-sm"
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              {itinerary.responseJson ? (
                <div className="space-y-6">
                  {/* Trip Summary */}
                  {itinerary.responseJson.trip_summary && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Trip Summary</h4>
                      <div className="grid grid-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Route:</span> {itinerary.responseJson.trip_summary.route}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {itinerary.responseJson.trip_summary.duration_days} days
                        </div>
                        <div>
                          <span className="font-medium">Total Cost:</span> {itinerary.responseJson.trip_summary.currency} {itinerary.responseJson.trip_summary.total_estimated_cost}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Daily Plan */}
                  {itinerary.responseJson.daily_plan && (
                    <div>
                      <h4 className="font-semibold mb-3">Daily Itinerary</h4>
                      <div className="space-y-4">
                        {itinerary.responseJson.daily_plan.map((day, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="font-medium mb-2">Day {day.day} - {day.date}</div>
                            <div className="text-sm text-gray-600 mb-2">{day.city}</div>
                            
                            <div className="space-y-2">
                              {day.morning && day.morning.length > 0 && (
                                <div>
                                  <span className="font-medium text-blue-600">Morning:</span>
                                  <ul className="ml-4 text-sm">
                                    {day.morning.map((activity, i) => (
                                      <li key={i}>• {activity}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {day.afternoon && day.afternoon.length > 0 && (
                                <div>
                                  <span className="font-medium text-orange-600">Afternoon:</span>
                                  <ul className="ml-4 text-sm">
                                    {day.afternoon.map((activity, i) => (
                                      <li key={i}>• {activity}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {day.evening && day.evening.length > 0 && (
                                <div>
                                  <span className="font-medium text-purple-600">Evening:</span>
                                  <ul className="ml-4 text-sm">
                                    {day.evening.map((activity, i) => (
                                      <li key={i}>• {activity}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            
                            {day.meals && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="font-medium text-sm">Meals:</div>
                                <div className="grid grid-3 gap-2 text-xs">
                                  <div><span className="font-medium">Breakfast:</span> {day.meals.breakfast}</div>
                                  <div><span className="font-medium">Lunch:</span> {day.meals.lunch}</div>
                                  <div><span className="font-medium">Dinner:</span> {day.meals.dinner}</div>
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <span className="font-medium text-sm">Daily Cost:</span> {itinerary.responseJson.trip_summary?.currency} {day.estimated_daily_cost}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  {(itinerary.responseJson.packing_tips || itinerary.responseJson.local_tips) && (
                    <div className="grid grid-2 gap-4">
                      {itinerary.responseJson.packing_tips && (
                        <div>
                          <h4 className="font-semibold mb-2">Packing Tips</h4>
                          <ul className="space-y-1 text-sm">
                            {itinerary.responseJson.packing_tips.map((tip, index) => (
                              <li key={index}>• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {itinerary.responseJson.local_tips && (
                        <div>
                          <h4 className="font-semibold mb-2">Local Tips</h4>
                          <ul className="space-y-1 text-sm">
                            {itinerary.responseJson.local_tips.map((tip, index) => (
                              <li key={index}>• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Save to MyTrips Button */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">Ready to Save?</h4>
                        <p className="text-gray-600 text-sm">Add this itinerary to your MyTrips for easy access</p>
                      </div>
                      <button
                        onClick={handleSaveToMyTrips}
                        disabled={isSaving}
                        className={`btn flex items-center gap-2 ${
                          savedSuccess 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'btn-primary'
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Saving...
                          </>
                        ) : savedSuccess ? (
                          <>
                            <Check size={18} />
                            Saved!
                          </>
                        ) : (
                          <>
                            <Save size={18} />
                            Save to MyTrips
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-600">
                  <p>Generated response:</p>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-auto">
                    {itinerary.responseText}
                  </pre>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="card bg-red-50 border-red-200">
              <div className="text-red-800">
                <h4 className="font-semibold">Error</h4>
                <p>{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiItineraryGenerator; 