import React, { useState } from 'react'
import { Search, MapPin, Star, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import VantaGlobe from './VantaGlobe'

const CitySearch = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilters, setSelectedFilters] = useState({
    region: '',
    costLevel: '',
    popularity: ''
  })
  const [shortlisted, setShortlisted] = useState([])
  const navigate = useNavigate()

  const cities = [
    {
      id: 1,
      name: 'Paris',
      country: 'France',
      region: 'Europe',
      costIndex: 'High',
      popularity: 4.8,
      trips: 1250,
      image: 'https://plus.unsplash.com/premium_photo-1729068649640-4d45d0a4db12?q=80&w=2128&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'The City of Light, famous for its art, fashion, and cuisine'
    },
    {
      id: 2,
      name: 'Tokyo',
      country: 'Japan',
      region: 'Asia',
      costIndex: 'High',
      popularity: 4.7,
      trips: 980,
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop',
      description: 'Modern metropolis blending tradition with cutting-edge technology'
    },
    {
      id: 3,
      name: 'Barcelona',
      country: 'Spain',
      region: 'Europe',
      costIndex: 'Medium',
      popularity: 4.6,
      trips: 850,
      image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=300&h=200&fit=crop',
      description: 'Vibrant city known for Gaudí architecture and Mediterranean culture'
    },
    {
      id: 4,
      name: 'Bangkok',
      country: 'Thailand',
      region: 'Asia',
      costIndex: 'Low',
      popularity: 4.5,
      trips: 720,
      image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=300&h=200&fit=crop',
      description: 'Bustling capital with temples, street food, and vibrant nightlife'
    },
    {
      id: 5,
      name: 'New York',
      country: 'USA',
      region: 'North America',
      costIndex: 'High',
      popularity: 4.9,
      trips: 1100,
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300&h=200&fit=crop',
      description: 'The Big Apple, iconic skyline and cultural melting pot'
    },
    {
      id: 6,
      name: 'Rome',
      country: 'Italy',
      region: 'Europe',
      costIndex: 'Medium',
      popularity: 4.7,
      trips: 920,
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=300&h=200&fit=crop',
      description: 'Eternal City with ancient history and incredible architecture'
    }
  ]

  const filteredCities = cities.filter(city => {
    const matchesSearch = city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         city.country.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRegion = !selectedFilters.region || city.region === selectedFilters.region
    const matchesCost = !selectedFilters.costLevel || city.costIndex === selectedFilters.costLevel
    
    return matchesSearch && matchesRegion && matchesCost
  })

  const handleAddToTrip = (city) => {
    if (!shortlisted.includes(city.id)) {
      const next = [...shortlisted, city.id]
      setShortlisted(next)
      try {
        localStorage.setItem('shortlistedCities', JSON.stringify(next))
        const storedTripsRaw = localStorage.getItem('userTrips')
        const storedTrips = storedTripsRaw ? JSON.parse(storedTripsRaw) : []
        const start = new Date()
        const end = new Date()
        end.setDate(start.getDate() + 3)
        const newTrip = {
          id: Date.now(),
          title: `${city.name} Trip`,
          destinations: [city.name],
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          status: 'planning',
          image: city.image,
          progress: 10
        }
        localStorage.setItem('userTrips', JSON.stringify([newTrip, ...storedTrips]))
      } catch {}
    }
  }

  const openDetails = (city) => navigate(`/city/${city.id}`, { state: { city } })

  const getCostColor = (costIndex) => {
    switch (costIndex) {
      case 'Low': return 'text-green-600 bg-green-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'High': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
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
        <h1 className="text-3xl font-bold mb-2">Explore Cities</h1>
        <p className="text-gray-600">Discover amazing destinations for your next adventure</p>
      </div>

      <div className="card mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search cities or countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={selectedFilters.region}
              onChange={(e) => setSelectedFilters({...selectedFilters, region: e.target.value})}
              className="form-input"
            >
              <option value="">All Regions</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
              <option value="North America">North America</option>
              <option value="South America">South America</option>
              <option value="Africa">Africa</option>
              <option value="Oceania">Oceania</option>
            </select>
            
            <select
              value={selectedFilters.costLevel}
              onChange={(e) => setSelectedFilters({...selectedFilters, costLevel: e.target.value})}
              className="form-input"
            >
              <option value="">All Costs</option>
              <option value="Low">Low Cost</option>
              <option value="Medium">Medium Cost</option>
              <option value="High">High Cost</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-2 gap-6">
        {filteredCities.map(city => {
          const isAdded = shortlisted.includes(city.id)
          return (
          <div
            key={city.id}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => openDetails(city)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetails(city) } }}
          >
            <div className="relative mb-4">
              <img 
                src={city.image} 
                alt={city.name}
                className="w-full h-48 rounded-lg object-cover"
              />
              <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium ${getCostColor(city.costIndex)}`}>
                {city.costIndex} Cost
              </div>
            </div>

            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl font-semibold">{city.name}</h3>
                <p className="text-gray-600 flex items-center gap-1">
                  <MapPin size={14} />
                  {city.country}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star size={16} fill="currentColor" />
                  <span className="font-medium">{city.popularity}</span>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Users size={14} />
                  {city.trips} trips
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">{city.description}</p>

            <div className="flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); handleAddToTrip(city) }} disabled={isAdded} className={`btn flex-1 ${isAdded ? 'btn-outline text-green-600 border-green-300 cursor-default' : 'btn-primary'}`}>
                {isAdded ? 'Added' : 'Add to Trip'}
              </button>
              <button onClick={(e) => { e.stopPropagation(); openDetails(city) }} className="btn btn-outline">
                View Details
              </button>
            </div>
          </div>
        )})}
      </div>

      {filteredCities.length === 0 && (
        <div className="text-center py-12">
          <MapPin size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No cities found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Details handled by /city/:id route */}
    </div>
  </VantaGlobe>
  )
}

export default CitySearch
