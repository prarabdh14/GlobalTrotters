import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginScreen from './components/LoginScreen'
import RegistrationScreen from './components/RegistrationScreen'
import GoogleAuthCallback from './components/GoogleAuthCallback'
import Dashboard from './components/Dashboard'
import CreateTrip from './components/CreateTrip'
import MyTrips from './components/MyTrips'
import ItineraryBuilder from './components/ItineraryBuilder'
import ItineraryView from './components/ItineraryView'
import CitySearch from './components/CitySearch'
import CityDetails from './components/CityDetails'
import ActivitySearch from './components/ActivitySearch'
import TripBudget from './components/TripBudget'
import TripCalendar from './components/TripCalendar'
import UserProfile from './components/UserProfile'
import AdminDashboard from './components/AdminDashboard'
import AiItineraryGenerator from './components/AiItineraryGenerator'
import Header from './components/Header'

import VantaGlobe from './components/VantaGlobe'
import { authApi } from './api/auth'
import { getAuthToken } from './api/client'


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const token = getAuthToken();
        if (token) {
          console.log('Found auth token, validating...');
          const { user } = await authApi.me()
          setCurrentUser(user)
          setIsAuthenticated(true)
          console.log('Authentication successful for user:', user.name);
        } else {
          console.log('No auth token found');
        }
      } catch (error) {
        console.error('Authentication failed:', error);
        // Clear invalid token and user data
        authApi.logout();
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    init()
  }, [])

  const handleLogin = (userData) => {
    console.log('Login successful for user:', userData.name);
    setIsAuthenticated(true)
    setCurrentUser(userData)
  }

  const handleLogout = () => {
    authApi.logout()
    setIsAuthenticated(false)
    setCurrentUser(null)
  }

  if (isLoading) {
    return (
      <VantaGlobe>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </div>
        </div>
      </VantaGlobe>
    )
  }

  if (!isAuthenticated) {
    return (
      <VantaGlobe>
        <div className="min-h-screen">
          <Routes>
            <Route path="/login" element={<LoginScreen onLogin={handleLogin} />} />
            <Route path="/register" element={<RegistrationScreen onLogin={handleLogin} />} />
            <Route path="/auth/google/callback" element={<GoogleAuthCallback onLogin={handleLogin} />} />
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
            <Route path="/" element={<Dashboard user={currentUser} />} />
            <Route path="/dashboard" element={<Dashboard user={currentUser} />} />
            <Route path="/create-trip" element={<CreateTrip />} />
            <Route path="/my-trips" element={<MyTrips />} />
            <Route path="/trip/:id/build" element={<ItineraryBuilder />} />
            <Route path="/trip/:id/view" element={<ItineraryView />} />
            <Route path="/trip/:id/budget" element={<TripBudget />} />
            <Route path="/budget" element={<TripBudget />} />
            <Route path="/trip/:id/calendar" element={<TripCalendar />} />
            <Route path="/search/cities" element={<CitySearch />} />
            <Route path="/city/:id" element={<CityDetails />} />
            <Route path="/search/activities" element={<ActivitySearch />} />
            <Route path="/ai-itinerary" element={<AiItineraryGenerator />} />
            <Route path="/calendar" element={<TripCalendar />} />
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
