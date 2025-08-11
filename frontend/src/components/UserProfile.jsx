import React, { useState } from 'react'
import { User, Mail, Phone, MapPin, Settings, Save, Camera, Bell, Globe, DollarSign } from 'lucide-react'
import VantaGlobe from './VantaGlobe'

const UserProfile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, USA',
    bio: 'Travel enthusiast who loves exploring new cultures and cuisines. Always planning the next adventure!',
    language: 'English',
    currency: 'USD',
    notifications: {
      email: true,
      push: false,
      marketing: true
    }
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('notifications.')) {
      const notificationKey = name.split('.')[1]
      setFormData({
        ...formData,
        notifications: {
          ...formData.notifications,
          [notificationKey]: checked
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Save profile changes
    setIsEditing(false)
  }

  const savedDestinations = [
    { name: 'Santorini', country: 'Greece', saved: '2 days ago' },
    { name: 'Kyoto', country: 'Japan', saved: '1 week ago' },
    { name: 'Machu Picchu', country: 'Peru', saved: '2 weeks ago' },
    { name: 'Reykjavik', country: 'Iceland', saved: '1 month ago' }
  ]

  const travelStats = [
    { label: 'Countries Visited', value: '12' },
    { label: 'Cities Explored', value: '47' },
    { label: 'Trips Completed', value: '8' },
    { label: 'Miles Traveled', value: '25,430' }
  ]

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
        <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Profile</h1>
          <p className="text-gray-600">Manage your account settings and travel preferences</p>
        </div>

        <div className="grid grid-2 gap-8">
          {/* Profile Information */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <User size={20} />
                Profile Information
              </h2>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-outline"
              >
                <Settings size={16} />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="form-input"
                      rows="3"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    <Save size={16} />
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={32} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{formData.name}</h3>
                    <p className="text-gray-600">{formData.location}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-500" />
                    <span>{formData.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-500" />
                    <span>{formData.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-gray-500" />
                    <span>{formData.location}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-600">{formData.bio}</p>
                </div>
              </div>
            )}
          </div>

          {/* Travel Statistics */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Travel Statistics</h2>
            <div className="grid grid-2 gap-4">
              {travelStats.map((stat, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="card mt-8">
          <h2 className="text-xl font-semibold mb-6">Preferences & Settings</h2>
          
          <div className="grid grid-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Globe size={16} />
                Regional Settings
              </h3>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Bell size={16} />
                Notifications
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="notifications.email"
                    checked={formData.notifications.email}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <span>Email notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="notifications.push"
                    checked={formData.notifications.push}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <span>Push notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="notifications.marketing"
                    checked={formData.notifications.marketing}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <span>Marketing emails</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Destinations */}
        <div className="card mt-8">
          <h2 className="text-xl font-semibold mb-6">Saved Destinations</h2>
          <div className="space-y-3">
            {savedDestinations.map((destination, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{destination.name}</div>
                  <div className="text-sm text-gray-600">{destination.country}</div>
                </div>
                <div className="text-sm text-gray-500">
                  Saved {destination.saved}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </VantaGlobe>
  )
}

export default UserProfile
