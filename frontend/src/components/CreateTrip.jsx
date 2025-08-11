import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, FileText, Upload } from 'lucide-react'

const CreateTrip = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    tripName: '',
    startDate: '',
    endDate: '',
    description: '',
    coverPhoto: null
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulate trip creation
    const tripId = Date.now()
    navigate(`/trip/${tripId}/build`)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      coverPhoto: e.target.files[0]
    })
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create a New Trip</h1>
          <p className="text-gray-600">Plan your next adventure by providing some basic details</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                <MapPin size={16} className="inline mr-2" />
                Trip Name
              </label>
              <input
                type="text"
                name="tripName"
                value={formData.tripName}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., European Adventure, Asian Discovery"
                required
              />
            </div>

            <div className="grid grid-2 gap-4 mb-4">
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} className="inline mr-2" />
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} className="inline mr-2" />
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <FileText size={16} className="inline mr-2" />
                Trip Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input"
                rows="4"
                placeholder="Describe your trip, what you're looking forward to, or any special occasions..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Upload size={16} className="inline mr-2" />
                Cover Photo (Optional)
              </label>
              <input
                type="file"
                name="coverPhoto"
                onChange={handleFileChange}
                className="form-input"
                accept="image/*"
              />
              <p className="text-sm text-gray-500 mt-2">Upload a photo that represents your trip</p>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="btn btn-primary flex-1">
                Create Trip & Start Planning
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateTrip
