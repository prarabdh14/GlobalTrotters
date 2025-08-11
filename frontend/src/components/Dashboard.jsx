import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MapPin, Calendar, DollarSign, TrendingUp, Sparkles } from 'lucide-react'
import AnimatedPage from './AnimatedPage'
import VantaGlobe from './VantaGlobe'

const Dashboard = () => {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const upcomingTrips = [
    {
      id: 1,
      title: 'European Adventure',
      destination: 'Paris, Rome, Barcelona',
      dates: 'Mar 15 - Mar 25, 2024',
      budget: '$2,500',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=300&h=200&fit=crop',
      progress: 75
    },
    {
      id: 2,
      title: 'Asian Discovery',
      destination: 'Tokyo, Seoul, Bangkok',
      dates: 'Jun 10 - Jun 20, 2024',
      budget: '$3,200',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop',
      progress: 45
    }
  ]

  const popularDestinations = [
    { name: 'Paris', country: 'France', trips: 1250, trend: '+12%' },
    { name: 'Tokyo', country: 'Japan', trips: 980, trend: '+8%' },
    { name: 'New York', country: 'USA', trips: 1100, trend: '+15%' },
    { name: 'London', country: 'UK', trips: 890, trend: '+5%' }
  ]

  const quickActions = [
    {
      title: 'Plan New Trip',
      description: 'Start planning your next adventure',
      icon: Plus,
      color: 'bg-gradient-to-br from-blue-500 to-purple-600',
      link: '/create-trip'
    },
    {
      title: 'Explore Cities',
      description: 'Discover amazing destinations',
      icon: MapPin,
      color: 'bg-gradient-to-br from-green-500 to-teal-600',
      link: '/search/cities'
    },
    {
      title: 'Find Activities',
      description: 'Browse exciting experiences',
      icon: Calendar,
      color: 'bg-gradient-to-br from-purple-500 to-pink-600',
      link: '/search/activities'
    }
  ]

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
        {/* Hero Section */}
        <div className="mb-12 text-center animate-fade-in-up">
          <div className="relative inline-block">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Welcome back, John! ✨
            </h1>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
          </div>
          <p className="text-xl text-gray-600 animate-fade-in-up stagger-1">
            Ready to plan your next adventure?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-4 gap-6 mb-12">
          {[
            { label: 'Total Trips', value: '12', icon: MapPin, color: 'text-blue-600' },
            { label: 'Countries', value: '8', icon: TrendingUp, color: 'text-green-600' },
            { label: 'Cities', value: '24', icon: Calendar, color: 'text-purple-600' },
            { label: 'Budget Saved', value: '$1.2K', icon: DollarSign, color: 'text-orange-600' }
          ].map((stat, index) => (
            <div key={index} className={`card hover-lift animate-scale-in stagger-${index + 1}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon size={32} className={stat.color} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-2 gap-8 mb-12">
          {/* Upcoming Trips */}
          <div className="card animate-fade-in-left">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="text-yellow-500" size={24} />
                Upcoming Trips
              </h2>
              <Link to="/my-trips" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                View All →
              </Link>
            </div>
            
            {upcomingTrips.length > 0 ? (
              <div className="space-y-6">
                {upcomingTrips.map((trip, index) => (
                  <div key={trip.id} className={`group hover-lift animate-fade-in-up stagger-${index + 1}`}>
                    <div className="relative overflow-hidden rounded-2xl">
                      <img 
                        src={trip.image} 
                        alt={trip.title}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-xl font-bold mb-2">{trip.title}</h3>
                        <div className="flex items-center gap-4 text-sm mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {trip.destination}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {trip.dates}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{trip.budget}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-white/30 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-1000"
                                style={{ width: `${trip.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{trip.progress}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 animate-fade-in-up">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No trips yet</h3>
                <p className="text-gray-600 mb-6">Start planning your first adventure!</p>
                <Link to="/create-trip" className="btn btn-primary">
                  <Plus size={16} />
                  Plan Your First Trip
                </Link>
              </div>
            )}
          </div>

          {/* Popular Destinations */}
          <div className="card animate-fade-in-right">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="text-green-500" size={24} />
              Trending Destinations
            </h2>
            <div className="space-y-4">
              {popularDestinations.map((dest, index) => (
                <div key={index} className={`group p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 cursor-pointer animate-fade-in-up stagger-${index + 1}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MapPin size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{dest.name}</div>
                        <div className="text-sm text-gray-500">{dest.country}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">{dest.trend}</div>
                      <div className="text-xs text-gray-500">{dest.trips} trips</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-3 gap-8">
          {quickActions.map((action, index) => (
            <Link 
              key={index}
              to={action.link} 
              className={`card hover-lift text-center group animate-scale-in stagger-${index + 1}`}
            >
              <div className={`w-16 h-16 ${action.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <action.icon size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                {action.title}
              </h3>
              <p className="text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>
      </AnimatedPage>
    </VantaGlobe>
  )
}

export default Dashboard
