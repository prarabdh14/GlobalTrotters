import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Calendar, ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react'

const TripCalendar = () => {
  const { id } = useParams()
  const [currentDate, setCurrentDate] = useState(new Date(2024, 2, 1)) // March 2024

  const tripEvents = [
    { date: 15, title: 'Arrive in Paris', time: '10:00 AM', type: 'travel' },
    { date: 15, title: 'Eiffel Tower Visit', time: '2:00 PM', type: 'activity' },
    { date: 16, title: 'Louvre Museum', time: '10:00 AM', type: 'activity' },
    { date: 16, title: 'Seine River Cruise', time: '6:00 PM', type: 'activity' },
    { date: 17, title: 'Montmartre District', time: '11:00 AM', type: 'activity' },
    { date: 18, title: 'Travel to Rome', time: '8:00 AM', type: 'travel' },
    { date: 18, title: 'Colosseum Tour', time: '3:00 PM', type: 'activity' },
    { date: 19, title: 'Vatican Museums', time: '9:00 AM', type: 'activity' },
    { date: 20, title: 'Travel to Barcelona', time: '7:00 AM', type: 'travel' },
    { date: 20, title: 'Sagrada Familia', time: '2:00 PM', type: 'activity' },
    { date: 21, title: 'Park Güell', time: '10:00 AM', type: 'activity' },
    { date: 22, title: 'Departure', time: '12:00 PM', type: 'travel' }
  ]

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDate = (day) => {
    return tripEvents.filter(event => event.date === day)
  }

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'travel': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'activity': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => null)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Trip Calendar</h1>
        <p className="text-gray-600">View your itinerary in calendar format</p>
      </div>

      <div className="card">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => navigateMonth(-1)}
              className="btn btn-outline p-2"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => navigateMonth(1)}
              className="btn btn-outline p-2"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(day => (
            <div key={day} className="p-3 text-center font-semibold text-gray-600 bg-gray-50">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="h-32 bg-gray-50"></div>
          ))}
          
          {days.map(day => {
            const events = getEventsForDate(day)
            const isToday = day === 15 // Highlight trip start date
            
            return (
              <div 
                key={day} 
                className={`h-32 p-2 border border-gray-200 ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {day}
                </div>
                
                <div className="space-y-1">
                  {events.slice(0, 2).map((event, index) => (
                    <div 
                      key={index}
                      className={`text-xs p-1 rounded border ${getEventTypeColor(event.type)}`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="flex items-center gap-1 opacity-75">
                        <Clock size={10} />
                        {event.time}
                      </div>
                    </div>
                  ))}
                  
                  {events.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{events.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-6 mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
            <span className="text-sm text-gray-600">Travel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
            <span className="text-sm text-gray-600">Activities</span>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="card mt-8">
        <h2 className="text-xl font-semibold mb-6">Upcoming Events</h2>
        <div className="space-y-3">
          {tripEvents.slice(0, 5).map((event, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-center min-w-[60px]">
                <div className="text-lg font-bold text-blue-600">Mar</div>
                <div className="text-2xl font-bold">{event.date}</div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{event.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {event.time}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${getEventTypeColor(event.type)}`}>
                    {event.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TripCalendar
