import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, FileText, Upload, DollarSign } from 'lucide-react'
import { tripsApi } from '../api/trips'

const CreateTrip = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    tripName: '',
    startDate: '',
    endDate: '',
    description: '',
    budget: '',
    coverPhoto: null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const payload = {
        name: formData.tripName,
        description: formData.description || '—',
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: parseFloat(formData.budget) || 0,
        coverImg: null,
      }
      const { trip } = await tripsApi.create(payload)
      navigate(`/trip/${trip.id}/build`)
    } catch (err) {
      setError(err.message || 'Failed to create trip')
    } finally {
      setIsSubmitting(false)
    }
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
              
              {/* Personalized Suggestion Tags */}
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Popular descriptions:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Much needed break', 'Long overdue vacation', 'Celebrating our anniversary', 
                    'First time visiting', 'Been dreaming about this', 'Girls trip', 'Boys trip',
                    'Making memories with family', 'Exploring local culture', 'Trying authentic food',
                    'Disconnecting from work', 'Adventure of a lifetime', 'Bucket list destination',
                    'Spontaneous getaway', 'Perfect weather escape', 'Instagram-worthy spots'
                  ].map((tag, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        const currentDescription = formData.description;
                        const newDescription = currentDescription 
                          ? `${currentDescription} ${tag}.`
                          : `${tag}.`;
                        setFormData(prev => ({
                          ...prev,
                          description: newDescription
                        }));
                      }}
                      className="px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-300 border border-blue-200 hover:border-blue-300 hover:shadow-md hover:scale-105"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <DollarSign size={16} className="inline mr-2" />
                Total Budget (₹)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your total trip budget"
                min="0"
                step="100"
              />
              <p className="text-sm text-gray-500 mt-2">Set your total budget for this trip</p>
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

            {error && (
              <div className="text-red-600 text-sm mb-2">{error}</div>
            )}

            <div className="flex gap-4">
              <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Trip & Start Planning'}
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
