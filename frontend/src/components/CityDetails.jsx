import React, { useMemo, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { MapPin, Star, Users, Plus, ArrowLeft } from 'lucide-react'

const CityDetails = () => {
  const { id } = useParams()
  const { state } = useLocation()
  const passedCity = state && state.city ? state.city : null
  const [shortlistedIds, setShortlistedIds] = useState(() => {
    try {
      const stored = localStorage.getItem('shortlistedCities')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const allCities = useMemo(() => ([
    { id: 1, name: 'Paris', country: 'France', region: 'Europe', costIndex: 'High', popularity: 4.8, trips: 1250, image: 'https://plus.unsplash.com/premium_photo-1729068649640-4d45d0a4db12?q=80&w=2128&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', description: 'The City of Light, famous for its art, fashion, and cuisine' },
    { id: 2, name: 'Tokyo', country: 'Japan', region: 'Asia', costIndex: 'High', popularity: 4.7, trips: 980, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop', description: 'Modern metropolis blending tradition with cutting-edge technology' },
    { id: 3, name: 'Barcelona', country: 'Spain', region: 'Europe', costIndex: 'Medium', popularity: 4.6, trips: 850, image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=300&h=200&fit=crop', description: 'Vibrant city known for Gaudí architecture and Mediterranean culture' },
    { id: 4, name: 'Bangkok', country: 'Thailand', region: 'Asia', costIndex: 'Low', popularity: 4.5, trips: 720, image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=300&h=200&fit=crop', description: 'Bustling capital with temples, street food, and vibrant nightlife' },
    { id: 5, name: 'New York', country: 'USA', region: 'North America', costIndex: 'High', popularity: 4.9, trips: 1100, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300&h=200&fit=crop', description: 'The Big Apple, iconic skyline and cultural melting pot' },
    { id: 6, name: 'Rome', country: 'Italy', region: 'Europe', costIndex: 'Medium', popularity: 4.7, trips: 920, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=300&h=200&fit=crop', description: 'Eternal City with ancient history and incredible architecture' }
  ]), [])

  const city = useMemo(() => {
    if (passedCity) return passedCity
    const numericId = Number(id)
    return allCities.find(c => c.id === numericId) || null
  }, [passedCity, id, allCities])

  const isAdded = city ? shortlistedIds.includes(city.id) : false

  const handleAddToTrip = () => {
    if (!city) return
    if (!shortlistedIds.includes(city.id)) {
      const next = [...shortlistedIds, city.id]
      setShortlistedIds(next)
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

  if (!city) {
    return (
      <div className="container py-8 relative z-10">
        <Link to="/search/cities" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
          <ArrowLeft size={16} /> Back to Cities
        </Link>
        <div className="card bg-white/10 border border-white/20 backdrop-blur-md text-white p-6">
          City not found.
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 relative z-10">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">{city.name}</h1>
          <p className="text-white/70 flex items-center gap-2"><MapPin size={16} /> {city.country} • {city.region}</p>
        </div>
        <Link to="/search/cities" className="inline-flex items-center gap-2 text-white/80 hover:text-white">
          <ArrowLeft size={16} /> Back
        </Link>
      </div>

      <div className="card bg-white/10 border border-white/20 backdrop-blur-md text-white p-6">
        <img src={city.image} alt={city.name} className="w-full h-72 object-cover rounded-xl mb-4" />
        <p className="text-white/80 mb-4">{city.description}</p>
        <div className="flex items-center gap-6 text-sm text-white/70 mb-6">
          <span className="flex items-center gap-1"><MapPin size={14} /> {city.region}</span>
          <span className="flex items-center gap-1"><Users size={14} /> {city.trips} trips</span>
          <span className="flex items-center gap-1"><Star size={14} /> {city.popularity}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAddToTrip} disabled={isAdded} className={`btn ${isAdded ? 'btn-outline text-green-400 border-green-300 cursor-default' : 'btn-primary'}`}>
            {isAdded ? 'Added' : 'Add to Trip'}
          </button>
          <Link to="/search/cities" className="btn btn-outline">Close</Link>
        </div>
      </div>
    </div>
  )
}

export default CityDetails 