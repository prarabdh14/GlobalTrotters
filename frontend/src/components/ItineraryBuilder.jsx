import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Plus, MapPin, Calendar, Clock, DollarSign, X } from 'lucide-react'
import VantaGlobe from './VantaGlobe'

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
  const [addActivityForSectionId, setAddActivityForSectionId] = useState(null)
  const [newActivity, setNewActivity] = useState({ name: '', time: '', cost: '' })

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

  const saveActivity = () => {
    if (!addActivityForSectionId || !newActivity.name.trim()) return
    const activityToAdd = {
      name: newActivity.name.trim(),
      time: newActivity.time.trim() || '—',
      cost: newActivity.cost.trim() || '—'
    }
    setSections(prevSections => prevSections.map(section => (
      section.id === addActivityForSectionId
        ? { ...section, activities: [...section.activities, activityToAdd] }
        : section
    )))
    setNewActivity({ name: '', time: '', cost: '' })
    setAddActivityForSectionId(null)
  }

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
          <div key={section.id} className="card bg-white/10 border border-white/20 backdrop-blur-md text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 text-white">{section.title}</h3>
                <p className="text-white/80 text-sm mb-4">{section.description}</p>
              </div>
              <span
                role="button"
                tabIndex={0}
                onClick={() => removeSection(section.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); removeSection(section.id) } }}
                className="p-2 -m-2 inline-flex items-center justify-center text-red-200 hover:text-red-100 transition-colors cursor-pointer select-none focus:outline-none focus:ring-0"
                aria-label="Remove section"
              >
                <X size={18} />
              </span>
            </div>

            <div className="space-y-3">
              {section.activities.map((activity, actIndex) => (
                <div key={actIndex} className="flex justify-between items-center p-3 bg-transparent border border-white/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-blue-300" />
                    <span className="font-medium text-white">{activity.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/80">
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
              {addActivityForSectionId === section.id ? (
                <div className="rounded-lg border border-white/20 p-3 bg-transparent space-y-3">
                  <div className="form-group">
                    <input
                      type="text"
                      value={newActivity.name}
                      onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                      className="form-input bg-transparent border border-white/30 text-white placeholder:text-white/50"
                      placeholder="Activity name"
                    />
                  </div>
                  <div className="grid grid-2 gap-3">
                    <input
                      type="text"
                      value={newActivity.time}
                      onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                      className="form-input bg-transparent border border-white/30 text-white placeholder:text-white/50"
                      placeholder="Time (e.g., 9:00 AM)"
                    />
                    <input
                      type="text"
                      value={newActivity.cost}
                      onChange={(e) => setNewActivity({ ...newActivity, cost: e.target.value })}
                      className="form-input bg-transparent border border-white/30 text-white placeholder:text-white/50"
                      placeholder="Cost (e.g., $25)"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={saveActivity} className="btn btn-primary">
                      Save Activity
                    </button>
                    <button onClick={() => { setAddActivityForSectionId(null); setNewActivity({ name: '', time: '', cost: '' }) }} className="btn btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddActivityForSectionId(section.id)} className="w-full p-3 border-2 border-dashed border-white/30 rounded-lg text-white/80 hover:border-blue-400 hover:text-blue-300 transition-colors bg-transparent">
                  <Plus size={16} className="inline mr-2" />
                  Add Activity
                </button>
              )}
            </div>
          </div>
        ))}

        {showAddSection ? (
          <div className="card bg-white/10 border border-white/20 backdrop-blur-md text-white">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Add New Section</h3>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label text-white/80">Section Title</label>
                <input
                  type="text"
                  value={newSection.title}
                  onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                  className="form-input bg-transparent border border-white/30 text-white placeholder:text-white/50"
                  placeholder="e.g., Day 1, Morning Activities, etc."
                />
              </div>
              <div className="form-group">
                <label className="form-label text-white/80">Description</label>
                <textarea
                  value={newSection.description}
                  onChange={(e) => setNewSection({...newSection, description: e.target.value})}
                  className="form-input bg-transparent border border-white/30 text-white placeholder:text-white/50"
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
            className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-white/30 rounded-xl text-white/80 hover:border-blue-400 hover:text-blue-300 transition-colors bg-transparent text-sm"
          >
            <Plus size={18} className="inline" />
            Add Another Section
          </button>
        )}
      </div>
    </div>
    
  </VantaGlobe>
  )
}

export default ItineraryBuilder
