import React, { useState, useEffect } from 'react'
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
import { authApi } from './api/auth'
import { getAuthToken } from './api/client'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const init = async () => {
      try {
        if (getAuthToken()) {
          const { user } = await authApi.me()
          setCurrentUser(user)
          setIsAuthenticated(true)
        }
      } catch {
        // token invalid or not present; remain logged out
      }
    }
    init()
  }, [])

  const handleLogin = (userData) => {
    setIsAuthenticated(true)
    setCurrentUser(userData)
  }

  const handleLogout = () => {
    authApi.logout()
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
