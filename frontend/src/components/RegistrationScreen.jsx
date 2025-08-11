import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Globe, User, Mail, Phone, MapPin, Lock, Eye, EyeOff } from 'lucide-react'
import { authApi } from '../api/auth'

const RegistrationScreen = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    additionalInfo: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (formData.password.length < 6) {
      setIsLoading(false)
      return setError('Password must be at least 6 characters long')
    }
    if (formData.password !== formData.confirmPassword) {
      setIsLoading(false)
      return setError('Passwords do not match')
    }

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim()
      const { user } = await authApi.register({
        name: fullName,
        email: formData.email,
        password: formData.password
      })
      onLogin(user)
    } catch (err) {
      setError(err.message || 'Failed to register')
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      <div className={`max-w-md w-full relative z-10 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* Logo Section */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="relative">
              <Globe size={48} className="text-blue-600 animate-pulse" />
              <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
            </div>
            <h1 className="text-4xl font-bold gradient-text">GlobeTrotter</h1>
          </div>
          <p className="text-gray-600 text-lg animate-fade-in-up stagger-1">
            Create your account
          </p>
        </div>

        {/* Registration Form */}
        <div className="card animate-scale-in stagger-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-2 gap-4 animate-fade-in-up stagger-3">
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <User size={16} className="text-blue-600" />
                  First Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="form-input pl-12"
                    placeholder="First Name"
                    required
                  />
                  <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <User size={16} className="text-blue-600" />
                  Last Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="form-input pl-12"
                    placeholder="Last Name"
                    required
                  />
                  <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="form-group animate-fade-in-up stagger-4">
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

            {/* Password Fields */}
            <div className="grid grid-2 gap-4 animate-fade-in-up stagger-5">
              <div className="form-group">
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
                    placeholder="Enter a password"
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
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <Lock size={16} className="text-blue-600" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input pl-12 pr-12"
                    placeholder="Re-enter password"
                    required
                  />
                  <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Phone Field */}
            <div className="form-group animate-fade-in-up stagger-6">
              <label className="form-label flex items-center gap-2">
                <Phone size={16} className="text-blue-600" />
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input pl-12"
                  placeholder="Enter your phone number"
                />
                <Phone size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Location Fields */}
            <div className="grid grid-2 gap-4 animate-fade-in-up stagger-7">
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <MapPin size={16} className="text-blue-600" />
                  City
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="form-input pl-12"
                    placeholder="City"
                  />
                  <MapPin size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <MapPin size={16} className="text-blue-600" />
                  Country
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="form-input pl-12"
                    placeholder="Country"
                  />
                  <MapPin size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Additional Info Field */}
            <div className="form-group animate-fade-in-up stagger-8">
              <label className="form-label flex items-center gap-2">
                <User size={16} className="text-blue-600" />
                Additional Information
              </label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                className="form-input"
                rows="3"
                placeholder="Tell us about your travel preferences..."
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm animate-fade-in-up">{error}</div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="btn btn-primary w-full animate-fade-in-up stagger-9 relative overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="loading-spinner w-5 h-5"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>

            <div className="text-center animate-fade-in-up stagger-10">
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors hover:underline"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-3 gap-4 animate-fade-in-up stagger-11">
          {[
            { icon: '🗺️', text: 'Plan Trips' },
            { icon: '✈️', text: 'Book Flights' },
            { icon: '🏨', text: 'Find Hotels' }
          ].map((feature, index) => (
            <div key={index} className="text-center p-3 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-300">
              <div className="text-2xl mb-1">{feature.icon}</div>
              <div className="text-sm font-medium text-gray-700">{feature.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RegistrationScreen
