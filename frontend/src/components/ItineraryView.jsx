import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, MapPin, Clock, DollarSign, Share2, Copy, Edit } from 'lucide-react'
import VantaGlobe from './VantaGlobe'

const ItineraryView = () => {
  const { id } = useParams()
  const [viewMode, setViewMode] = useState('timeline')

  const itinerary = {
    title: 'European Adventure',
    dates: 'March 15 - March 25, 2024',
    destinations: ['Paris', 'Rome', 'Barcelona'],
    days: [
      {
        date: '2024-03-15',
        city: 'Paris',
        activities: [
          { time: '9:00 AM', name: 'Visit Eiffel Tower', cost: '$25', duration: '2 hours' },
          { time: '2:00 PM', name: 'Seine River Cruise', cost: '$35', duration: '1.5 hours' },
          { time: '7:00 PM', name: 'Dinner at Le Comptoir', cost: '$80', duration: '2 hours' }
        ]
      },
      {
        date: '2024-03-16',
        city: 'Paris',
        activities: [
          { time: '10:00 AM', name: 'Louvre Museum', cost: '$20', duration: '3 hours' },
          { time: '3:00 PM', name: 'Champs-Élysées Shopping', cost: '$100', duration: '2 hours' },
          { time: '8:00 PM', name: 'Moulin Rouge Show', cost: '$120', duration: '2 hours' }
        ]
      },
      {
        date: '2024-03-17',
        city: 'Paris',
        activities: [
          { time: '11:00 AM', name: 'Montmartre District', cost: '$15', duration: '2 hours' },
          { time: '1:00 PM', name: 'Sacré-Cœur Basilica', cost: 'Free', duration: '1 hour' },
          { time: '6:00 PM', name: 'Latin Quarter Walk', cost: 'Free', duration: '2 hours' }
        ]
      }
    ]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTotalDayCost = (activities) => {
    return activities.reduce((total, activity) => {
      const cost = activity.cost === 'Free' ? 0 : parseInt(activity.cost.replace('$', ''))
      return total + cost
    }, 0)
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
            <h1 className="text-3xl font-bold mb-2">{itinerary.title}</h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Calendar size={16} />
              {itinerary.dates}
            </p>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <MapPin size={16} />
              {itinerary.destinations.join(' → ')}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-outline">
              <Share2 size={16} />
              Share
            </button>
            <button className="btn btn-outline">
              <Copy size={16} />
              Copy Trip
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

      {viewMode === 'timeline' && (
        <div className="space-y-8">
          {itinerary.days.map((day, index) => (
            <div key={index} className="card bg-white border border-gray-200 text-gray-900">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{formatDate(day.date)}</h2>
                  <p className="text-gray-700 flex items-center gap-2">
                    <MapPin size={16} />
                    {day.city}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    ${getTotalDayCost(day.activities)}
                  </div>
                  <div className="text-sm text-gray-600">Total for day</div>
                </div>
              </div>

              <div className="space-y-4">
                {day.activities.map((activity, actIndex) => (
                  <div key={actIndex} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="text-sm font-medium text-blue-700 min-w-[80px]">
                      {activity.time}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1 text-gray-900">{activity.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-700">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {activity.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign size={14} />
                          {activity.cost}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
