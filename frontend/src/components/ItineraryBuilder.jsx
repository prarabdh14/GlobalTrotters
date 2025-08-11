import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Plus, MapPin, Calendar, Clock, DollarSign, X } from 'lucide-react'

const ItineraryBuilder = () => {
  const { id } = useParams()
  const [sections, setSections] = useState([
    {
      id: 1,
      title: 'Section 1',
      description: 'All the necessary information about this section. This can be anything from the basic outline, brief or any other activity.',
      activities: [
        { name: 'Visit Eiffel Tower', time: '9:00 AM', cost: '$25' },
        { name: 'Seine River Cruise', time: '2:00 PM', cost: '$35' }
      ]
    },
    {
      id: 2,
      title: 'Section 2',
      description: 'All the necessary information about this section. This can be anything from the basic outline, brief or any other activity.',
      activities: [
        { name: 'Louvre Museum', time: '10:00 AM', cost: '$20' },
        { name: 'Champs-Élysées Shopping', time: '3:00 PM', cost: '$100' }
      ]
    },
    {
      id: 3,
      title: 'Section 3',
      description: 'All the necessary information about this section. This can be anything from the basic outline, brief or any other activity.',
      activities: [
        { name: 'Montmartre District', time: '11:00 AM', cost: '$15' },
        { name: 'Sacré-Cœur Basilica', time: '1:00 PM', cost: 'Free' }
      ]
    }
  ])

  const [showAddSection, setShowAddSection] = useState(false)
  const [newSection, setNewSection] = useState({
    title: '',
    description: ''
  })

  const addSection = () => {
    if (newSection.title && newSection.description) {
      setSections([...sections, {
        id: Date.now(),
        title: newSection.title,
        description: newSection.description,
        activities: []
      }])
      setNewSection({ title: '', description: '' })
      setShowAddSection(false)
    }
  }

  const removeSection = (sectionId) => {
    setSections(sections.filter(section => section.id !== sectionId))
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Build Itinerary</h1>
            <p className="text-gray-600">Plan your trip day by day with activities and experiences</p>
          </div>
          <div className="flex gap-3">
            <Link to={`/trip/${id}/view`} className="btn btn-outline">
              Preview
            </Link>
            <Link to={`/trip/${id}/budget`} className="btn btn-secondary">
              <DollarSign size={16} />
              Budget
            </Link>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Suggestions for Places to Visit/Activities to perform</h3>
          <div className="grid grid-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white border border-blue-200 rounded-lg p-3 h-20 flex items-center justify-center text-gray-400">
                Suggestion {i}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={section.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{section.description}</p>
              </div>
              <button 
                onClick={() => removeSection(section.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {section.activities.map((activity, actIndex) => (
                <div key={actIndex} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-gray-500" />
                    <span className="font-medium">{activity.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {activity.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={14} />
                      {activity.cost}
                    </span>
                  </div>
                </div>
              ))}
              
              <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
                <Plus size={16} className="inline mr-2" />
                Add Activity
              </button>
            </div>
          </div>
        ))}

        {showAddSection ? (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Add New Section</h3>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Section Title</label>
                <input
                  type="text"
                  value={newSection.title}
                  onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                  className="form-input"
                  placeholder="e.g., Day 1, Morning Activities, etc."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={newSection.description}
                  onChange={(e) => setNewSection({...newSection, description: e.target.value})}
                  className="form-input"
                  rows="3"
                  placeholder="Describe what this section covers..."
                />
              </div>
              <div className="flex gap-3">
                <button onClick={addSection} className="btn btn-primary">
                  Add Section
                </button>
                <button 
                  onClick={() => setShowAddSection(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setShowAddSection(true)}
            className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Plus size={24} className="inline mr-2" />
            Add Another Section
          </button>
        )}
      </div>
    </div>
  )
}

export default ItineraryBuilder
