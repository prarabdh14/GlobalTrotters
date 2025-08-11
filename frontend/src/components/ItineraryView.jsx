import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Clock, DollarSign, Share2, Copy, Edit, Loader2, Sparkles } from 'lucide-react'
import VantaGlobe from './VantaGlobe'
import { tripsApi } from '../api/trips'
import { aiApi } from '../api/ai'

const ItineraryView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState('timeline')
  const [trip, setTrip] = useState(null)
  const [aiItinerary, setAiItinerary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTripData()
  }, [id])

  const fetchTripData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching trip data for ID:', id)

      // Check if this is an AI-generated trip
      if (id.startsWith('ai-')) {
        const aiId = id.replace('ai-', '')
        console.log('Fetching AI itinerary with ID:', aiId)
        const aiData = await aiApi.getUserItineraries()
        console.log('AI data received:', aiData)
        
        const foundAi = aiData.find(ai => ai.id.toString() === aiId)
        console.log('Found AI itinerary:', foundAi)
        
        if (foundAi) {
          setAiItinerary(foundAi)
          
          // Parse the responseJson if it's a string
          let responseData = foundAi.responseJson
          if (typeof responseData === 'string') {
            try {
              responseData = JSON.parse(responseData)
            } catch (parseError) {
              console.error('Error parsing AI response JSON:', parseError)
              responseData = {}
            }
          }
          
          console.log('Parsed AI response data:', responseData)
          
          // Transform AI data to match trip format
          const transformedTrip = {
            id: `ai-${foundAi.id}`,
            title: `${foundAi.source} to ${foundAi.destination}`,
            description: responseData?.trip_summary?.route || '',
            startDate: foundAi.startDate,
            endDate: foundAi.endDate,
            isAiGenerated: true,
            days: responseData?.daily_plan || []
          }
          console.log('Transformed AI trip:', transformedTrip)
          setTrip(transformedTrip)
        } else {
          setError('AI itinerary not found')
        }
      } else {
        // Regular trip
        console.log('Fetching regular trip with ID:', id)
        const response = await tripsApi.get(id)
        console.log('Regular trip response:', response)
        
        // Make sure we have the full trip data with stops and activities
        const tripData = response.trip || response
        console.log('Trip data:', tripData)
        
        // If the trip doesn't have stops loaded, we might need to fetch them separately
        if (tripData && !tripData.stops) {
          console.log('Trip has no stops, might need to fetch them separately')
        }
        
        setTrip(tripData)
      }
    } catch (err) {
      console.error('Error fetching trip:', err)
      setError('Failed to load trip details')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
  }

  const getDestinations = (trip) => {
    if (trip.isAiGenerated && trip.days) {
      return [...new Set(trip.days.map(day => day.city))]
    }
    if (trip.stops) {
      return trip.stops.map(stop => stop.city?.name).filter(Boolean)
    }
    return []
  }

  const getTotalDayCost = (activities) => {
    if (!activities) return 0
    return activities.reduce((total, activity) => {
      const cost = activity.cost === 'Free' ? 0 : parseInt(activity.cost.replace('$', ''))
      return total + cost
    }, 0)
  }

  const handleShare = async () => {
    try {
      const shareData = {
        title: trip.title,
        text: `Check out my trip: ${trip.title}`,
        url: window.location.href
      }

      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`
        await navigator.clipboard.writeText(shareText)
        alert('Trip details copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('Trip URL copied to clipboard!')
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError)
        alert('Unable to share trip')
      }
    }
  }

  if (loading) {
    return (
      <VantaGlobe>
        <div className="container py-8 relative z-10">
          <div className="text-center py-12">
            <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading trip details...</p>
          </div>
        </div>
      </VantaGlobe>
    )
  }

  if (error || !trip) {
    return (
      <VantaGlobe>
        <div className="container py-8 relative z-10">
          <div className="text-center py-12">
            <div className="card bg-red-50 border-red-200 max-w-md mx-auto">
              <div className="text-red-800">
                <h4 className="font-semibold">Error</h4>
                <p>{error || 'Trip not found'}</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/my-trips')}
              className="btn btn-primary mt-4"
            >
              Back to My Trips
            </button>
          </div>
        </div>
      </VantaGlobe>
    )
  }

  return (
    <VantaGlobe
      color={0x3f51b5}
      color2={0xffffff}
      backgroundColor={0x0a0a0a}
      size={0.8}
      points={8.00}
      maxDistance={15.00}
      spacing={12.00}
      showDots={true}
    >
      <div className="container py-8 relative z-10">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              {trip.title}
              {trip.isAiGenerated && (
                <span className="px-2 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                  <Sparkles size={14} className="inline mr-1" />
                  AI
                </span>
              )}
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Calendar size={16} />
              {formatDateRange(trip.startDate, trip.endDate)}
            </p>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <MapPin size={16} />
              {getDestinations(trip).join(' → ')}
            </p>
            {trip.description && (
              <p className="text-gray-600 mt-2">{trip.description}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleShare}
              className="btn btn-outline text-white/80 border-white/30 hover:text-blue-300 hover:border-blue-400"
            >
              <Share2 size={16} />
              Share
            </button>
            <Link to={`/trip/${id}/build`} className="btn btn-primary">
              <Edit size={16} />
              Edit
            </Link>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setViewMode('timeline')}
            className={`btn ${viewMode === 'timeline' ? 'btn-primary' : 'btn-outline'}`}
          >
            Timeline View
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-outline'}`}
          >
            Calendar View
          </button>
        </div>
      </div>

      {/* Debug section - remove this later */}
      <div className="card bg-yellow-50 border-yellow-200 mb-6">
        <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
        <pre className="text-xs text-yellow-700 overflow-auto">
          {JSON.stringify({ trip, isAiGenerated: trip?.isAiGenerated, days: trip?.days, stops: trip?.stops }, null, 2)}
        </pre>
      </div>

      {viewMode === 'timeline' && (
        <div className="space-y-8">
          {trip.isAiGenerated && trip.days ? (
            // AI-generated itinerary view
            trip.days.map((day, index) => (
              <div key={index} className="card bg-white border border-gray-200 text-gray-900">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Day {day.day} - {formatDate(day.date)}</h2>
                    <p className="text-gray-700 flex items-center gap-2">
                      <MapPin size={16} />
                      {day.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      ₹{day.estimated_daily_cost || 0}
                    </div>
                    <div className="text-sm text-gray-600">Estimated cost</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Morning Activities */}
                  {day.morning && day.morning.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-blue-600">Morning</h3>
                      {day.morning.map((activity, actIndex) => (
                        <div key={actIndex} className="flex items-center gap-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-sm font-medium text-blue-700 min-w-[80px]">
                            Morning
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium mb-1 text-gray-900">{activity}</h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Afternoon Activities */}
                  {day.afternoon && day.afternoon.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-orange-600">Afternoon</h3>
                      {day.afternoon.map((activity, actIndex) => (
                        <div key={actIndex} className="flex items-center gap-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="text-sm font-medium text-orange-700 min-w-[80px]">
                            Afternoon
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium mb-1 text-gray-900">{activity}</h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Evening Activities */}
                  {day.evening && day.evening.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-purple-600">Evening</h3>
                      {day.evening.map((activity, actIndex) => (
                        <div key={actIndex} className="flex items-center gap-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="text-sm font-medium text-purple-700 min-w-[80px]">
                            Evening
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium mb-1 text-gray-900">{activity}</h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Meals */}
                  {day.meals && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-green-600">Meals</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-sm font-medium text-green-700">Breakfast</div>
                          <div className="text-sm text-gray-700">{day.meals.breakfast}</div>
                        </div>
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-sm font-medium text-green-700">Lunch</div>
                          <div className="text-sm text-gray-700">{day.meals.lunch}</div>
                        </div>
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-sm font-medium text-green-700">Dinner</div>
                          <div className="text-sm text-gray-700">{day.meals.dinner}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : trip.stops ? (
            // Regular trip view
            trip.stops.map((stop, index) => (
              <div key={index} className="card bg-white border border-gray-200 text-gray-900">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {stop.startDate ? formatDate(stop.startDate) : `Stop ${index + 1}`}
                    </h2>
                    <p className="text-gray-700 flex items-center gap-2">
                      <MapPin size={16} />
                      {stop.city?.name || 'Unknown City'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Stop {index + 1}</div>
                  </div>
                </div>

                {stop.activities && stop.activities.length > 0 ? (
                  <div className="space-y-4">
                    {stop.activities.map((tripActivity, actIndex) => (
                      <div key={actIndex} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="text-sm font-medium text-blue-700 min-w-[80px]">
                          {tripActivity.startTime ? formatDate(tripActivity.startTime) : 'TBD'}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium mb-1 text-gray-900">{tripActivity.activity?.name || 'Activity'}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-700">
                            <span className="flex items-center gap-1">
                              <DollarSign size={14} />
                              ₹{tripActivity.activity?.cost || 0}
                            </span>
                            {tripActivity.note && (
                              <span className="text-gray-600">{tripActivity.note}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No activities planned for this stop</p>
                    <p className="text-sm mt-2">Add activities to see them here</p>
                  </div>
                )}
              </div>
            ))
          ) : trip.stops && trip.stops.length === 0 ? (
            <div className="text-center py-12">
              <div className="card bg-blue-50 border-blue-200 max-w-md mx-auto">
                <div className="text-blue-800">
                  <h4 className="font-semibold mb-2">No Stops Added Yet</h4>
                  <p className="mb-4">This trip doesn't have any stops planned yet.</p>
                  <Link to={`/trip/${id}/build`} className="btn btn-primary">
                    <Edit size={16} className="mr-2" />
                    Add Stops
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No itinerary details available</p>
            </div>
          )}
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="card">
          <div className="text-center py-12">
            <Calendar size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Calendar View</h3>
            <p className="text-gray-600">Calendar view implementation would go here</p>
          </div>
        </div>
      )}
    </div>
  </VantaGlobe>
  )
}

export default ItineraryView
