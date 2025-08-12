import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Search,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  LogOut,
  Shield
} from 'lucide-react';
import { adminApi } from '../api/admin';
import { authApi } from '../api/auth';
import VantaGlobe from './VantaGlobe';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [userPage, setUserPage] = useState(1);
  const [tripPage, setTripPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [tripSearch, setTripSearch] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboard, analytics] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getAnalytics()
      ]);
      setDashboardData(dashboard);
      setAnalyticsData(analytics);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (page = 1, search = '') => {
    try {
      const response = await adminApi.getUsers({ page, limit: 10, search });
      setUsers(response);
    } catch (err) {
      console.error('Fetch users error:', err);
    }
  };

  const fetchTrips = async (page = 1, search = '') => {
    try {
      const response = await adminApi.getTrips({ page, limit: 10, search });
      setTrips(response);
    } catch (err) {
      console.error('Fetch trips error:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers(userPage, userSearch);
    }
  }, [activeTab, userPage, userSearch]);

  useEffect(() => {
    if (activeTab === 'trips') {
      fetchTrips(tripPage, tripSearch);
    }
  }, [activeTab, tripPage, tripSearch]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Logout button clicked');
    
    // Clear admin token specifically
    localStorage.removeItem('gt_token');
    localStorage.removeItem('admin');
    localStorage.removeItem('user');
    
    // Navigate to login
    navigate('/login');
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', change }) => (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{formatNumber(value)}</p>
          {change && (
            <p className={`text-sm mt-1 ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-500/20`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, title, icon: Icon, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        active 
          ? 'bg-white/20 text-white border border-white/30' 
          : 'text-white/60 hover:text-white hover:bg-white/10'
      }`}
    >
      <Icon size={16} />
      {title}
    </button>
  );

  if (loading) {
    return (
      <VantaGlobe>
        <div className="container py-8 relative z-10">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
              <p className="text-white">Loading admin dashboard...</p>
            </div>
          </div>
        </div>
      </VantaGlobe>
    );
  }

  if (error) {
    return (
      <VantaGlobe>
        <div className="container py-8 relative z-10">
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </VantaGlobe>
    );
  }

  return (
    <VantaGlobe>
      <div className="container py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-white/60">Monitor platform performance and user activity</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Admin Info */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                <Shield size={16} className="text-purple-400" />
                <span className="text-white font-medium">Admin Panel</span>
              </div>
              
              {/* Refresh Button */}
              <button
                type="button"
                onClick={fetchDashboardData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              
              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8">
          <TabButton 
            id="overview" 
            title="Overview" 
            icon={BarChart3} 
            active={activeTab === 'overview'} 
          />
          <TabButton 
            id="users" 
            title="Users" 
            icon={Users} 
            active={activeTab === 'users'} 
          />
          <TabButton 
            id="trips" 
            title="Trips" 
            icon={MapPin} 
            active={activeTab === 'trips'} 
          />
          <TabButton 
            id="analytics" 
            title="Analytics" 
            icon={TrendingUp} 
            active={activeTab === 'analytics'} 
          />
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardData && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={dashboardData.stats.totalUsers}
                icon={Users}
                color="blue"
                change={12}
              />
              <StatCard
                title="Total Trips"
                value={dashboardData.stats.totalTrips}
                icon={MapPin}
                color="green"
                change={8}
              />
              <StatCard
                title="AI Itineraries"
                value={dashboardData.stats.totalAiItineraries}
                icon={Activity}
                color="purple"
                change={15}
              />
              <StatCard
                title="New This Month"
                value={dashboardData.stats.newUsersThisMonth}
                icon={TrendingUp}
                color="orange"
                change={5}
              />
            </div>

            {/* Top Cities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Top Cities</h3>
                <div className="space-y-3">
                  {dashboardData.topCities.map((city, index) => (
                    <div key={city.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <span className="text-blue-400 font-semibold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{city.name}</p>
                          <p className="text-white/60 text-sm">{city.country}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{city.popularity.toFixed(1)}</p>
                        <p className="text-white/60 text-sm">popularity</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Recent Users</h3>
                <div className="space-y-3">
                  {dashboardData.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-white/60 text-sm">{user.email}</p>
                      </div>
                      <p className="text-white/60 text-sm">{formatDate(user.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-white font-semibold">User</th>
                      <th className="px-6 py-3 text-left text-white font-semibold">Email</th>
                      <th className="px-6 py-3 text-left text-white font-semibold">Joined</th>
                      <th className="px-6 py-3 text-left text-white font-semibold">Trips</th>
                      <th className="px-6 py-3 text-left text-white font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-white font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {users.users?.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                              <span className="text-blue-400 font-semibold text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-white font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white/80">{user.email}</td>
                        <td className="px-6 py-4 text-white/80">{formatDate(user.createdAt)}</td>
                        <td className="px-6 py-4 text-white/80">{user._count.trips}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isEmailVerified 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {user.isEmailVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1 text-white/60 hover:text-white">
                              <Eye size={16} />
                            </button>
                            <button className="p-1 text-white/60 hover:text-white">
                              <Edit size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {users.pagination && (
                <div className="px-6 py-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-white/60">
                      Showing {((users.pagination.page - 1) * users.pagination.limit) + 1} to{' '}
                      {Math.min(users.pagination.page * users.pagination.limit, users.pagination.total)} of{' '}
                      {users.pagination.total} users
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setUserPage(Math.max(1, userPage - 1))}
                        disabled={userPage === 1}
                        className="p-2 text-white/60 hover:text-white disabled:opacity-50"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-white px-3 py-1 bg-white/10 rounded">
                        {userPage} / {users.pagination.pages}
                      </span>
                      <button
                        onClick={() => setUserPage(Math.min(users.pagination.pages, userPage + 1))}
                        disabled={userPage === users.pagination.pages}
                        className="p-2 text-white/60 hover:text-white disabled:opacity-50"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trips Tab */}
        {activeTab === 'trips' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
                <input
                  type="text"
                  placeholder="Search trips..."
                  value={tripSearch}
                  onChange={(e) => setTripSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* Trips Table */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-white font-semibold">Trip</th>
                      <th className="px-6 py-3 text-left text-white font-semibold">User</th>
                      <th className="px-6 py-3 text-left text-white font-semibold">Dates</th>
                      <th className="px-6 py-3 text-left text-white font-semibold">Stops</th>
                      <th className="px-6 py-3 text-left text-white font-semibold">Created</th>
                      <th className="px-6 py-3 text-left text-white font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {trips.trips?.map((trip) => (
                      <tr key={trip.id} className="hover:bg-white/5">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">{trip.name}</p>
                            <p className="text-white/60 text-sm">{trip.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white/80">{trip.user.name}</td>
                        <td className="px-6 py-4 text-white/80">
                          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </td>
                        <td className="px-6 py-4 text-white/80">{trip.stops.length}</td>
                        <td className="px-6 py-4 text-white/80">{formatDate(trip.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1 text-white/60 hover:text-white">
                              <Eye size={16} />
                            </button>
                            <button className="p-1 text-white/60 hover:text-white">
                              <Edit size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {trips.pagination && (
                <div className="px-6 py-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-white/60">
                      Showing {((trips.pagination.page - 1) * trips.pagination.limit) + 1} to{' '}
                      {Math.min(trips.pagination.page * trips.pagination.limit, trips.pagination.total)} of{' '}
                      {trips.pagination.total} trips
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTripPage(Math.max(1, tripPage - 1))}
                        disabled={tripPage === 1}
                        className="p-2 text-white/60 hover:text-white disabled:opacity-50"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-white px-3 py-1 bg-white/10 rounded">
                        {tripPage} / {trips.pagination.pages}
                      </span>
                      <button
                        onClick={() => setTripPage(Math.min(trips.pagination.pages, tripPage + 1))}
                        disabled={tripPage === trips.pagination.pages}
                        className="p-2 text-white/60 hover:text-white disabled:opacity-50"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analyticsData && (
          <div className="space-y-8">
            {/* Popular Cities Chart */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Popular Destinations</h3>
              <div className="space-y-3">
                {analyticsData.popularCities.map((city, index) => (
                  <div key={city.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{city.name}</p>
                        <p className="text-white/60 text-sm">{city.country}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{city.tripCount} trips</p>
                      <p className="text-white/60 text-sm">Cost: ₹{city.costIndex}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Monthly Trends</h3>
              <div className="space-y-3">
                {analyticsData.monthlyTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">
                        {new Date(trend.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-white font-semibold">{trend.unique_users}</p>
                        <p className="text-white/60 text-sm">Users</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold">{trend.total_trips}</p>
                        <p className="text-white/60 text-sm">Trips</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </VantaGlobe>
  );
};

export default AdminDashboard;
