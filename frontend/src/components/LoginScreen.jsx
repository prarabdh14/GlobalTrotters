import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Globe, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { authApi } from '../api/auth'

// Google OAuth
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const LoginScreen = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log('LoginScreen mounted, starting animation sequence...')
    // First, immediately hide the form
    setIsVisible(false)
    
    // Then, after a short delay, show it with animation
    const timer = setTimeout(() => {
      console.log('Setting isVisible to true - starting slide-in animation')
      setIsVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { user } = await authApi.login({
        email: formData.email,
        password: formData.password
      })
      onLogin(user)
    } catch (err) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Initialize Google Sign-In
      if (!window.google) {
        setError('Google Sign-In not available')
        return
      }

      const google = window.google
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const { user } = await authApi.googleLogin(response.credential)
            onLogin(user)
          } catch (err) {
            setError(err.message || 'Google sign-in failed')
          } finally {
            setIsLoading(false)
          }
        }
      })

      google.accounts.id.prompt()
    } catch (err) {
      setError('Google sign-in failed')
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Logo Section - Top Left Corner of Page */}
      <div className="fixed top-8 left-12 z-50 animate-fade-in-up">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Globe size={32} className="text-blue-600 animate-pulse" />
            <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
          </div>
          <h1 className="text-2xl font-bold gradient-text">GlobeTrotter</h1>
        </div>
      </div>

      <div className="h-screen flex items-center py-4 px-4 relative overflow-hidden" key="login-screen" style={{overflow: 'hidden'}}>
        <div 
          className={`w-80 relative z-40`}
          style={{
            marginLeft: '290px',
            transform: isVisible ? 'translateX(0) scale(1)' : 'translateX(-150px) scale(0.8)',
            opacity: isVisible ? 1 : 0,
            transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onClick={() => console.log('Current isVisible state:', isVisible)}
        >
        {/* Login Form Header */}
        <div className="mb-4 animate-fade-in-up text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-2 animate-fade-in-up stagger-1">
            Welcome!
          </h2>
          <p className="text-gray-600 text-lg animate-fade-in-up stagger-1">
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <div className="card animate-scale-in stagger-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group animate-fade-in-up stagger-3">
              <label className="form-label flex items-center gap-2">
                <Mail size={16} className="text-blue-600" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input pl-12"
                  placeholder="Enter your email"
                  required
                />
                <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="form-group animate-fade-in-up stagger-4">
              <label className="form-label flex items-center gap-2">
                <Lock size={16} className="text-blue-600" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input pl-12 pr-12"
                  placeholder="Enter your password"
                  required
                />
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="btn btn-primary w-full animate-fade-in-up stagger-5 relative overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="loading-spinner w-5 h-5"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Divider */}
            <div className="relative animate-fade-in-up stagger-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 animate-fade-in-up stagger-7"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

            <div className="text-center animate-fade-in-up stagger-8">
              <Link 
                to="/register" 
                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors hover:underline"
              >
                Don't have an account? Sign up!
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  )
}

export default LoginScreen
