import React, { useState } from 'react'
import { Users, MapPin, TrendingUp, DollarSign, Calendar, Activity, BarChart3, PieChart } from 'lucide-react'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const stats = {
    totalUsers: 12450,
    activeTrips: 3280,
    totalRevenue: 485000,
    avgTripValue: 1250
  }

  const popularDestinations = [
    { name: 'Paris', trips: 1250, growth: '+12%' },
    { name: 'Tokyo', trips: 980, growth: '+8%' },
    { name: 'New York', trips: 1100, growth: '+15%' },
    { name: 'London', trips: 890, growth: '+5%' },
    { name: 'Barcelona', trips: 750, growth: '+18%' }
  ]

  const recentUsers = [
    { name: 'John Smith', email: 'john@example.com', joined: '2024-03-15', trips: 2 },
    { name: 'Sarah Johnson', email: 'sarah@example.com', joined: '2024-03-14', trips: 1 },
    { name: 'Mike Wilson', email: 'mike@example.com', joined: '2024-03-13', trips: 3 },
    { name: 'Emma Davis', email: 'emma@example.com', joined: '2024-03-12', trips: 1 }
  ]

  const monthlyData = [
    { month: 'Jan', users: 850, trips: 320, revenue: 42000 },
    { month: 'Feb', users: 920, trips: 380, revenue: 48000 },
    { month: 'Mar', users: 1100, trips: 450, revenue: 56000 },
    { month: 'Apr', users: 980, trips: 420, revenue: 52000 },
    { month: 'May', users: 1250, trips: 520, revenue: 65000 }
  ]

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor platform performance and user activity</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-4 gap-6 mb-8">
        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
            <Users size={24} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.totalUsers.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
            <MapPin size={24} className="text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.activeTrips.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Active Trips</div>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
            <DollarSign size={24} className="text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            ${stats.totalRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-3">
            <TrendingUp size={24} className="text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            ${stats.avgTripValue}
          </div>
          <div className="text-sm text-gray-600">Avg Trip Value</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'overview' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'users' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'analytics' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-2 gap-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <TrendingUp size={20} />
              Popular Destinations
            </h2>
            <div className="space-y-4">
              {popularDestinations.map((destination, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{destination.name}</div>
                    <div className="text-sm text-gray-600">{destination.trips} trips</div>
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    {destination.growth}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Activity size={20} />
              Recent Activity
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">New user registered</div>
                  <div className="text-xs text-gray-600">Sarah Johnson joined 5 minutes ago</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Trip completed</div>
                  <div className="text-xs text-gray-600">European Adventure by John Smith</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">New trip created</div>
                  <div className="text-xs text-gray-600">Asian Discovery by Emma Davis</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Users size={20} />
            Recent Users
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Joined</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Trips</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{user.name}</td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4 text-gray-600">{user.joined}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                        {user.trips}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <BarChart3 size={20} />
              Monthly Performance
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Month</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">New Users</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Trips Created</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((data, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium">{data.month}</td>
                      <td className="py-3 px-4">{data.users.toLocaleString()}</td>
                      <td className="py-3 px-4">{data.trips.toLocaleString()}</td>
                      <td className="py-3 px-4 font-medium text-green-600">
                        ${data.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-2 gap-8">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PieChart size={18} />
                Trip Categories
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Adventure</span>
                  <span className="font-medium">35%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cultural</span>
                  <span className="font-medium">28%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Relaxation</span>
                  <span className="font-medium">22%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Business</span>
                  <span className="font-medium">15%</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">User Retention Rate</span>
                  <span className="font-medium text-green-600">78%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg. Session Duration</span>
                  <span className="font-medium">12m 34s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trip Completion Rate</span>
                  <span className="font-medium text-green-600">92%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Customer Satisfaction</span>
                  <span className="font-medium text-green-600">4.8/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
