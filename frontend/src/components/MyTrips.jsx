import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Edit, Eye, Trash2, Plus, Filter, Search } from 'lucide-react'
import AnimatedPage from './AnimatedPage'
import VantaGlobe from './VantaGlobe'

const MyTrips = () => {
  const [trips] = useState([
    {
      id: 1,
      title: 'European Adventure',
      destinations: ['Paris', 'Rome', 'Barcelona'],
      startDate: '2024-03-15',
      endDate: '2024-03-25',
      status: 'upcoming',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=300&h=200&fit=crop',
      progress: 85
    },
    {
      id: 2,
      title: 'Asian Discovery',
      destinations: ['Tokyo', 'Seoul', 'Bangkok'],
      startDate: '2024-06-10',
      endDate: '2024-06-20',
      status: 'planning',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop',
      progress: 45
    },
    {
      id: 3,
      title: 'California Road Trip',
      destinations: ['Los Angeles', 'San Francisco', 'San Diego'],
      startDate: '2023-12-01',
      endDate: '2023-12-10',
      status: 'completed',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop',
      progress: 100
    }
  ])

  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const getStatusConfig = (status) => {
    switch (status) {
      case 'upcoming': 
        return { 
          color: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white', 
          icon: '🚀',
          label: 'Upcoming'
        }
      case 'planning': 
        return { 
          color: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white', 
          icon: '📋',
          label: 'Planning'
        }
      case 'completed': 
        return { 
          color: 'bg-gradient-to-r from-gray-500 to-slate-600 text-white', 
          icon: '✅',
          label: 'Completed'
        }
      default: 
        return { 
          color: 'bg-gray-100 text-gray-800', 
          icon: '📝',
          label: 'Draft'
        }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const filteredTrips = trips.filter(trip => {
    const matchesFilter = filter === 'all' || trip.status === filter
    const matchesSearch = trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.destinations.some(dest => dest.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesFilter && matchesSearch
  })

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
      <AnimatedPage>
        <div className="container py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-4xl font-bold mb-2 gradient-text">My Trips ✈️</h1>
            <p className="text-gray-600 text-lg">Manage and view all your travel plans</p>
          </div>
          <Link to="/create-trip" className="btn btn-primary mt-4 md:mt-0 animate-scale-in">
            <Plus size={16} />
            New Trip
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="card mb-8 animate-fade-in-up stagger-1">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search trips or destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-12"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'upcoming', 'planning', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    filter === status 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trips Grid */}
        {filteredTrips.length > 0 ? (
          <div className="grid grid-2 gap-8">
            {filteredTrips.map((trip, index) => {
              const statusConfig = getStatusConfig(trip.status)
              
              return (
                <div key={trip.id} className={`card hover-lift group animate-scale-in stagger-${index + 2}`}>
                  <div className="relative mb-6 overflow-hidden rounded-2xl">
                    <img 
                      src={trip.image} 
                      alt={trip.title}
                      className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Status Badge */}
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.color} backdrop-blur-sm`}>
                      <span className="mr-1">{statusConfig.icon}</span>
                      {statusConfig.label}
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between text-white mb-2">
                        <span className="text-sm font-medium">Planning Progress</span>
                        <span className="text-sm">{trip.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-1000 ease-out"
                          style={{ width: `${trip.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold group-hover:text-blue-600 transition-colors">
                      {trip.title}
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={16} className="text-blue-500" />
                        <span className="text-sm font-medium">{trip.destinations.join(' → ')}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} className="text-green-500" />
                        <span className="text-sm font-medium">
                          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Link 
                        to={`/trip/${trip.id}/view`}
                        className="btn btn-outline flex-1 text-center group-hover:border-blue-500 group-hover:text-blue-600"
                      >
                        <Eye size={16} />
                        View
                      </Link>
                      <Link 
                        to={`/trip/${trip.id}/build`}
                        className="btn btn-secondary flex-1 text-center"
                      >
                        <Edit size={16} />
                        Edit
                      </Link>
                      <button className="btn btn-outline text-red-600 hover:bg-red-50 hover:border-red-300">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin size={48} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">No trips found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Start planning your first adventure!'
              }
            </p>
            <Link to="/create-trip" className="btn btn-primary">
              <Plus size={16} />
              Create Your First Trip
            </Link>
          </div>
        )}
      </div>
      </AnimatedPage>
    </VantaGlobe>
  )
}

export default MyTrips
