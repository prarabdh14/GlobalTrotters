import React, { useState } from 'react'
import { Search, Filter, Clock, DollarSign, Star, MapPin } from 'lucide-react'
import VantaGlobe from './VantaGlobe'

const ActivitySearch= () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    type: '',
    cost: '',
    duration: ''
  })

  const activities = [
    {
      id: 1,
      name: 'Eiffel Tower Visit',
      type: 'Sightseeing',
      location: 'Paris, France',
      duration: '2-3 hours',
      cost: '$25',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=300&h=200&fit=crop',
      description: 'Iconic iron tower offering breathtaking views of Paris'
    },
    {
      id: 2,
      name: 'Seine River Cruise',
      type: 'Tours',
      location: 'Paris, France',
      duration: '1-2 hours',
      cost: '$35',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=300&h=200&fit=crop',
      description: 'Romantic boat cruise along the historic Seine River'
    },
    {
      id: 3,
      name: 'Sushi Making Class',
      type: 'Food & Drink',
      location: 'Tokyo, Japan',
      duration: '3-4 hours',
      cost: '$80',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop',
      description: 'Learn to make authentic sushi from expert chefs'
    },
    {
      id: 4,
      name: 'Sagrada Familia Tour',
      type: 'Sightseeing',
      location: 'Barcelona, Spain',
      duration: '2-3 hours',
      cost: '$30',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=300&h=200&fit=crop',
      description: 'Explore Gaudí\'s masterpiece basilica with guided tour'
    },
    {
      id: 5,
      name: 'Thai Cooking Workshop',
      type: 'Food & Drink',
      location: 'Bangkok, Thailand',
      duration: '4-5 hours',
      cost: '$45',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=300&h=200&fit=crop',
      description: 'Master traditional Thai dishes in hands-on cooking class'
    },
    {
      id: 6,
      name: 'Broadway Show',
      type: 'Entertainment',
      location: 'New York, USA',
      duration: '2-3 hours',
      cost: '$120',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
      description: 'Experience world-class theater in the heart of NYC'
    },
    {
      id: 7,
      name: 'Colosseum Underground',
      type: 'Sightseeing',
      location: 'Rome, Italy',
      duration: '3-4 hours',
      cost: '$55',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=300&h=200&fit=crop',
      description: 'Exclusive access to the underground chambers of the Colosseum'
    },
    {
      id: 8,
      name: 'Helicopter City Tour',
      type: 'Adventure',
      location: 'New York, USA',
      duration: '30-45 minutes',
      cost: '$200',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300&h=200&fit=crop',
      description: 'Aerial views of Manhattan skyline from helicopter'
    }
  ]

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filters.type || activity.type === filters.type
    const matchesCost = !filters.cost || getCostRange(activity.cost) === filters.cost
    const matchesDuration = !filters.duration || getDurationRange(activity.duration) === filters.duration
    
    return matchesSearch && matchesType && matchesCost && matchesDuration
  })

  const getCostRange = (cost) => {
    const amount = parseInt(cost.replace('$', ''))
    if (amount < 30) return 'low'
    if (amount < 80) return 'medium'
    return 'high'
  }

  const getDurationRange = (duration) => {
    if (duration.includes('30') || duration.includes('1')) return 'short'
    if (duration.includes('2') || duration.includes('3')) return 'medium'
    return 'long'
  }

  const getTypeColor = (type) => {
    const colors = {
      'Sightseeing': 'bg-blue-100 text-blue-800',
      'Tours': 'bg-green-100 text-green-800',
      'Food & Drink': 'bg-orange-100 text-orange-800',
      'Entertainment': 'bg-purple-100 text-purple-800',
      'Adventure': 'bg-red-100 text-red-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
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
        <h1 className="text-3xl font-bold mb-2">Activity Search</h1>
        <p className="text-gray-600">Find exciting experiences and activities for your trip</p>
      </div>

      <div className="card mb-8">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="form-input"
            >
              <option value="">All Types</option>
              <option value="Sightseeing">Sightseeing</option>
              <option value="Tours">Tours</option>
              <option value="Food & Drink">Food & Drink</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Adventure">Adventure</option>
            </select>
            
            <select
              value={filters.cost}
              onChange={(e) => setFilters({...filters, cost: e.target.value})}
              className="form-input"
            >
              <option value="">All Costs</option>
              <option value="low">Under $30</option>
              <option value="medium">$30 - $80</option>
              <option value="high">Over $80</option>
            </select>
            
            <select
              value={filters.duration}
              onChange={(e) => setFilters({...filters, duration: e.target.value})}
              className="form-input"
            >
              <option value="">All Durations</option>
              <option value="short">Under 2 hours</option>
              <option value="medium">2-3 hours</option>
              <option value="long">4+ hours</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-2 gap-6">
        {filteredActivities.map(activity => (
          <div key={activity.id} className="card hover:shadow-lg transition-shadow">
            <div className="relative mb-4">
              <img 
                src={activity.image} 
                alt={activity.name}
                className="w-full h-48 rounded-lg object-cover"
              />
              <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(activity.type)}`}>
                {activity.type}
              </div>
              <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full flex items-center gap-1">
                <Star size={14} className="text-yellow-500" fill="currentColor" />
                <span className="text-sm font-medium">{activity.rating}</span>
              </div>
            </div>

            <div className="mb-3">
              <h3 className="text-lg font-semibold mb-1">{activity.name}</h3>
              <p className="text-gray-600 text-sm flex items-center gap-1 mb-2">
                <MapPin size={14} />
                {activity.location}
              </p>
              <p className="text-gray-600 text-sm">{activity.description}</p>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
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

            <div className="flex gap-2">
              <button className="btn btn-primary flex-1">
                Add to Itinerary
              </button>
              <button className="btn btn-outline">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <Filter size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No activities found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  </VantaGlobe>
  )
}

export default ActivitySearch
