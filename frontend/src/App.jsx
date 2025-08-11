import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginScreen from './components/LoginScreen'
import RegistrationScreen from './components/RegistrationScreen'
import Dashboard from './components/Dashboard'
import CreateTrip from './components/CreateTrip'
import MyTrips from './components/MyTrips'
import ItineraryBuilder from './components/ItineraryBuilder'
import ItineraryView from './components/ItineraryView'
import CitySearch from './components/CitySearch'
import ActivitySearch from './components/ActivitySearch'
import TripBudget from './components/TripBudget'
import TripCalendar from './components/TripCalendar'
import UserProfile from './components/UserProfile'
import AdminDashboard from './components/AdminDashboard'
import Header from './components/Header'
import VantaGlobe from './components/VantaGlobe'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  const handleLogin = (userData) => {
    setIsAuthenticated(true)
    setCurrentUser(userData)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser(null)
  }

  if (!isAuthenticated) {
    return (
      <VantaGlobe>
        <div className="min-h-screen">
          <Routes>
            <Route path="/login" element={<LoginScreen onLogin={handleLogin} />} />
            <Route path="/register" element={<RegistrationScreen onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </VantaGlobe>
    )
  }

  return (
    <VantaGlobe>
      <div className="min-h-screen">
        <Header user={currentUser} onLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-trip" element={<CreateTrip />} />
            <Route path="/my-trips" element={<MyTrips />} />
            <Route path="/trip/:id/build" element={<ItineraryBuilder />} />
            <Route path="/trip/:id/view" element={<ItineraryView />} />
            <Route path="/trip/:id/budget" element={<TripBudget />} />
            <Route path="/trip/:id/calendar" element={<TripCalendar />} />
            <Route path="/search/cities" element={<CitySearch />} />
            <Route path="/search/activities" element={<ActivitySearch />} />
            <Route path="/profile" element={<UserProfile user={currentUser} />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </VantaGlobe>
  )
}

export default App
