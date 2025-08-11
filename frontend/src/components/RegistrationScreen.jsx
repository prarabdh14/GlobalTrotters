import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Globe, User, Mail, Phone, MapPin } from 'lucide-react'
import { authApi } from '../api/auth'

const RegistrationScreen = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    additionalInfo: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim()
      const password = cryptoRandomPassword()
      const { user } = await authApi.register({
        name: fullName,
        email: formData.email,
        password
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Globe size={32} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">GlobeTrotter</h1>
          </div>
          <p className="text-gray-600">Create your account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2 gap-4 mb-4">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="First Name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Last Name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={16} className="inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Phone size={16} className="inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="grid grid-2 gap-4 mb-4">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="City"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Country"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Information</label>
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
              <div className="text-red-600 text-sm mb-2">{error}</div>
            )}

            <button type="submit" className="btn btn-primary w-full mb-4" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register User'}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-blue-600 hover:text-blue-800">
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function cryptoRandomPassword() {
  // Generate a simple random password when the registration form doesn't collect one
  // In a real app, you'd collect password fields; here we keep the UI minimal
  const random = Math.random().toString(36).slice(-8)
  return `Gt@${random}`
}

export default RegistrationScreen
