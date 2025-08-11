import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginScreen from './LoginScreen'
import RegistrationScreen from './RegistrationScreen'
import Dashboard from './Dashboard'
import CreateTrip from './CreateTrip'
import MyTrips from './MyTrips'
import ItineraryBuilder from './ItineraryBuilder'
import ItineraryView from './ItineraryView'
import CitySearch from './CitySearch'
import ActivitySearch from './ActivitySearch'
import TripBudget from './TripBudget'
import TripCalendar from './TripCalendar'
import UserProfile from './UserProfile'
import AdminDashboard from './AdminDashboard'
import Header from './Header'

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
      <Routes>
        <Route path="/login" element={<LoginScreen onLogin={handleLogin} />} />
        <Route path="/register" element={<RegistrationScreen onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
  )
}

export default App
