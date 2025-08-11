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
        // Regular trip - but check if it might be AI-generated based on description
        console.log('Fetching regular trip with ID:', id)
        const response = await tripsApi.get(id)
        console.log('Regular trip response:', response)
        
        // Make sure we have the full trip data with stops and activities
        const tripData = response.trip || response
        console.log('Trip data:', tripData)
        
        // Check if this trip was created from AI (based on description or name pattern)
        const isLikelyAiGenerated = tripData.description?.includes('AI-generated') || 
                                   tripData.name?.includes(' to ') ||
                                   (tripData.stops && tripData.stops.length === 0)
        
        if (isLikelyAiGenerated) {
          console.log('Trip appears to be AI-generated, checking for AI itinerary data...')
          
          // Try to find corresponding AI itinerary
          try {
            const aiData = await aiApi.getUserItineraries()
            console.log('AI data for comparison:', aiData)
            
            // Look for AI itinerary with matching source/destination
            const matchingAi = aiData.find(ai => {
              const aiTitle = `${ai.source} to ${ai.destination}`
              return aiTitle === tripData.name || 
                     aiTitle.includes(tripData.name) || 
                     tripData.name.includes(ai.source) ||
                     tripData.name.includes(ai.destination)
            })
            
            if (matchingAi) {
              console.log('Found matching AI itinerary:', matchingAi)
              setAiItinerary(matchingAi)
              
              // Parse the responseJson if it's a string
              let responseData = matchingAi.responseJson
              if (typeof responseData === 'string') {
                try {
                  responseData = JSON.parse(responseData)
                } catch (parseError) {
                  console.error('Error parsing AI response JSON:', parseError)
                  responseData = {}
                }
              }
              
              console.log('Parsed AI response data:', responseData)
              
              // Merge trip data with AI data
              const enhancedTripData = {
                ...tripData,
                isAiGenerated: true,
                days: responseData?.daily_plan || [],
                aiDescription: responseData?.trip_summary?.route || tripData.description
              }
              
              console.log('Enhanced trip data:', enhancedTripData)
              setTrip(enhancedTripData)
            } else {
              console.log('No matching AI itinerary found, using regular trip data')
              setTrip(tripData)
            }
          } catch (aiError) {
            console.error('Error fetching AI data:', aiError)
            setTrip(tripData)
          }
        } else {
          setTrip(tripData)
        }
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
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-4xl font-bold text-blue-300">
                {trip.title}
              </h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <Calendar size={20} className="text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Duration</p>
                  <p className="font-semibold text-white">{formatDateRange(trip.startDate, trip.endDate)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <MapPin size={20} className="text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Route</p>
                  <p className="font-semibold text-white">{getDestinations(trip).join(' → ')}</p>
                </div>
              </div>
            </div>
            
            {(trip.aiDescription || trip.description) && (
              <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-lg border border-blue-500/20">
                <p className="text-white/90 leading-relaxed">{trip.aiDescription || trip.description}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleShare}
              className="px-1 py-2 text-sm rounded-lg border border-white/30 text-white/80 hover:bg-white/10 transition-all duration-200 flex items-center gap-1"
            >
              <Share2 size={14} />
              Share
            </button>
            <Link 
              to={`/trip/${id}/build`} 
              className="px-1 py-1 text-sm rounded-lg bg-white/10 border border-white/30 text-white/80 hover:bg-white/20 transition-all duration-200 flex items-center gap-1"
            >
              <Edit size={14} />
              Edit
            </Link>
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          <button 
            onClick={() => setViewMode('timeline')}
            className={`px-4 h-12 rounded-xl font-medium transition-all duration-300 border flex items-center gap-2 ${
              viewMode === 'timeline' 
                ? 'btn btn-outline hover:border-blue-500 hover:text-blue-600' 
                : 'bg-transparent text-white/80 border-white/30 hover:bg-white/10'
            }`}
          >
            <Calendar size={16} />
            Timeline View
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={`px-4 h-12 rounded-xl font-medium transition-all duration-300 border flex items-center gap-2 ${
              viewMode === 'calendar' 
                ? 'btn btn-outline hover:border-blue-500 hover:text-blue-600' 
                : 'bg-transparent text-white/80 border-white/30 hover:bg-white/10'
            }`}
          >
            <Calendar size={16} />
            Calendar View
          </button>
        </div>
      </div>



      {viewMode === 'timeline' && (
        <div className="space-y-8">
          {trip.isAiGenerated && trip.days ? (
            // AI-generated itinerary view
            trip.days.map((day, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6 shadow-lg">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Day {day.day}</h2>
                    <p className="text-white/80 text-lg mb-1">{formatDate(day.date)}</p>
                    <p className="text-blue-300 flex items-center gap-2">
                      <MapPin size={16} />
                      {day.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">
                      ₹{day.estimated_daily_cost || 0}
                    </div>
                    <div className="text-sm text-white/60">Estimated cost</div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Morning Activities */}
                  {day.morning && day.morning.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-blue-300 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        Morning
                      </h3>
                      {day.morning.map((activity, actIndex) => (
                        <div key={actIndex} className="flex items-start gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg backdrop-blur-sm">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{activity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Afternoon Activities */}
                  {day.afternoon && day.afternoon.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-orange-300 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        Afternoon
                      </h3>
                      {day.afternoon.map((activity, actIndex) => (
                        <div key={actIndex} className="flex items-start gap-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg backdrop-blur-sm">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{activity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Evening Activities */}
                  {day.evening && day.evening.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        Evening
                      </h3>
                      {day.evening.map((activity, actIndex) => (
                        <div key={actIndex} className="flex items-start gap-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg backdrop-blur-sm">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{activity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Meals */}
                  {day.meals && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-green-300 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        Meals
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg backdrop-blur-sm">
                          <div className="text-sm font-semibold text-green-300 mb-1">Breakfast</div>
                          <div className="text-white/90">{day.meals.breakfast}</div>
                        </div>
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg backdrop-blur-sm">
                          <div className="text-sm font-semibold text-green-300 mb-1">Lunch</div>
                          <div className="text-white/90">{day.meals.lunch}</div>
                        </div>
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg backdrop-blur-sm">
                          <div className="text-sm font-semibold text-green-300 mb-1">Dinner</div>
                          <div className="text-white/90">{day.meals.dinner}</div>
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
              <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6 shadow-lg">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {stop.startDate ? formatDate(stop.startDate) : `Stop ${index + 1}`}
                    </h2>
                    <p className="text-green-300 flex items-center gap-2">
                      <MapPin size={16} />
                      {stop.city?.name || 'Unknown City'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white/60">Stop {index + 1}</div>
                  </div>
                </div>

                {stop.activities && stop.activities.length > 0 ? (
                  <div className="space-y-3">
                    {stop.activities.map((tripActivity, actIndex) => (
                      <div key={actIndex} className="flex items-start gap-4 p-4 bg-white/10 border border-white/20 rounded-lg backdrop-blur-sm">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{tripActivity.activity?.name || 'Activity'}</h3>
                          <div className="flex items-center gap-4 text-sm text-white/80">
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {tripActivity.startTime ? formatDate(tripActivity.startTime) : 'TBD'}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign size={14} />
                              ₹{tripActivity.activity?.cost || 0}
                            </span>
                            {tripActivity.note && (
                              <span className="text-white/70">{tripActivity.note}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                      <p className="text-white/60 mb-2">No activities planned for this stop</p>
                      <p className="text-sm text-white/40">Add activities to see them here</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : trip.stops && trip.stops.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-8 max-w-md mx-auto">
                <div className="text-white">
                  <h4 className="text-xl font-semibold mb-3">No Stops Added Yet</h4>
                  <p className="mb-6 text-white/80">This trip doesn't have any stops planned yet.</p>
                  <Link 
                    to={`/trip/${id}/build`} 
                    className="btn btn-primary inline-flex items-center gap-2"
                  >
                    <Edit size={16} />
                    Add Stops
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 max-w-md mx-auto">
                <p className="text-white/60">No itinerary details available</p>
              </div>
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
