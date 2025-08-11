import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Globe, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { authApi } from '../api/auth'

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

            <div className="text-center animate-fade-in-up stagger-6">
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
