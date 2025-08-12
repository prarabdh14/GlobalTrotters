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
  Shield,
  PieChart,
  BarChart,
  LineChart
} from 'lucide-react';
import { adminApi } from '../api/admin';
import { authApi } from '../api/auth';
import VantaGlobe from './VantaGlobe';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

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

  // Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 12
          },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true
      }
    }
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!analyticsData) return {};

    // User Growth Pie Chart
    const userGrowthData = {
      labels: ['New Users', 'Returning Users', 'Active Users'],
      datasets: [{
        data: [
          analyticsData.userGrowth?.newUsers || 0,
          analyticsData.userGrowth?.returningUsers || 0,
          analyticsData.userGrowth?.activeUsers || 0
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(16, 185, 129, 0.8)',   // Green
          'rgba(245, 158, 11, 0.8)'    // Yellow
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)'
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)'
        ]
      }]
    };

    // Trip Status Distribution
    const tripStatusData = {
      labels: ['Planning', 'Ongoing', 'Completed', 'Cancelled'],
      datasets: [{
        data: [
          analyticsData.tripStatus?.planning || 0,
          analyticsData.tripStatus?.ongoing || 0,
          analyticsData.tripStatus?.completed || 0,
          analyticsData.tripStatus?.cancelled || 0
        ],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',   // Indigo
          'rgba(34, 197, 94, 0.8)',    // Green
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(239, 68, 68, 0.8)'     // Red
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2
      }]
    };

    // Popular Cities Bar Chart
    const popularCitiesData = {
      labels: analyticsData.popularCities?.slice(0, 8).map(city => city.name) || [],
      datasets: [{
        label: 'Number of Trips',
        data: analyticsData.popularCities?.slice(0, 8).map(city => city.tripCount) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }]
    };

    // Monthly Trends Line Chart
    const monthlyTrendsData = {
      labels: analyticsData.monthlyTrends?.map(trend => 
        new Date(trend.month).toLocaleDateString('en-US', { month: 'short' })
      ) || [],
      datasets: [
        {
          label: 'Users',
          data: analyticsData.monthlyTrends?.map(trend => trend.unique_users) || [],
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: 'rgba(255, 255, 255, 1)',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        },
        {
          label: 'Trips',
          data: analyticsData.monthlyTrends?.map(trend => trend.total_trips) || [],
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(16, 185, 129, 1)',
          pointBorderColor: 'rgba(255, 255, 255, 1)',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ]
    };

    // Budget Distribution
    const budgetData = {
      labels: ['Transport', 'Accommodation', 'Activities', 'Food', 'Other'],
      datasets: [{
        data: [
          analyticsData.budgetDistribution?.transport || 25,
          analyticsData.budgetDistribution?.accommodation || 35,
          analyticsData.budgetDistribution?.activities || 20,
          analyticsData.budgetDistribution?.food || 15,
          analyticsData.budgetDistribution?.other || 5
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(16, 185, 129, 0.8)',   // Green
          'rgba(245, 158, 11, 0.8)',   // Yellow
          'rgba(239, 68, 68, 0.8)',    // Red
          'rgba(139, 92, 246, 0.8)'    // Purple
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)'
        ],
        borderWidth: 2
      }]
    };

    return {
      userGrowth: userGrowthData,
      tripStatus: tripStatusData,
      popularCities: popularCitiesData,
      monthlyTrends: monthlyTrendsData,
      budgetDistribution: budgetData
    };
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
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-2xl backdrop-saturate-150" style={{backdropFilter: 'blur(12px) saturate(150%)'}}>
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
          ? 'bg-white/15 backdrop-blur-md text-white border border-white/30 shadow-lg' 
        : 'text-white/60 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm'
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
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg backdrop-saturate-150" style={{backdropFilter: 'blur(8px) saturate(150%)'}}>
                <Shield size={16} className="text-purple-400" />
                <span className="text-white font-medium">Admin Panel</span>
              </div>
              
              {/* Refresh Button */}
              <button
                type="button"
                onClick={fetchDashboardData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/30 backdrop-blur-lg border-2 border-blue-400/50 text-white rounded-lg hover:bg-blue-500/40 hover:border-blue-300/70 active:bg-blue-600/70 active:border-blue-200 active:shadow-inner active:scale-95 transition-all duration-150 shadow-xl"
                style={{backdropFilter: 'blur(12px) saturate(160%)', background: 'rgba(59, 130, 246, 0.25)'}}
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              
              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/30 backdrop-blur-lg border-2 border-red-400/50 text-white rounded-lg hover:bg-red-500/40 hover:border-red-300/70 active:bg-red-600/70 active:border-red-200 active:shadow-inner active:scale-95 transition-all duration-150 shadow-xl"
                style={{backdropFilter: 'blur(12px) saturate(160%)', background: 'rgba(239, 68, 68, 0.25)'}}
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
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-2xl backdrop-saturate-150" style={{backdropFilter: 'blur(12px) saturate(150%)'}}>
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
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-2xl backdrop-saturate-150" style={{backdropFilter: 'blur(12px) saturate(150%)'}}>
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
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-2xl backdrop-saturate-150" style={{backdropFilter: 'blur(12px) saturate(150%)'}}>
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
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-2xl backdrop-saturate-150" style={{backdropFilter: 'blur(12px) saturate(150%)'}}>
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
            {/* Chart Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User Growth Pie Chart */}
              <div className="bg-white/[0.08] backdrop-blur-md border border-white/30 rounded-xl p-6 shadow-lg shadow-black/10">
                <div className="flex items-center gap-3 mb-6">
                  <PieChart className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-semibold text-white">User Growth Distribution</h3>
                </div>
                <div className="h-64">
                  <Pie data={prepareChartData().userGrowth} options={chartOptions} />
                </div>
              </div>

              {/* Trip Status Pie Chart */}
              <div className="bg-white/[0.08] backdrop-blur-md border border-white/30 rounded-xl p-6 shadow-lg shadow-black/10">
                <div className="flex items-center gap-3 mb-6">
                  <PieChart className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-semibold text-white">Trip Status Distribution</h3>
                </div>
                <div className="h-64">
                  <Pie data={prepareChartData().tripStatus} options={chartOptions} />
                </div>
              </div>

              {/* Budget Distribution Pie Chart */}
              <div className="bg-white/[0.08] backdrop-blur-md border border-white/30 rounded-xl p-6 shadow-lg shadow-black/10">
                <div className="flex items-center gap-3 mb-6">
                  <PieChart className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white">Budget Distribution</h3>
                </div>
                <div className="h-64">
                  <Pie data={prepareChartData().budgetDistribution} options={chartOptions} />
                </div>
              </div>

              {/* Popular Cities Bar Chart */}
              <div className="bg-white/[0.08] backdrop-blur-md border border-white/30 rounded-xl p-6 shadow-lg shadow-black/10">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart className="w-6 h-6 text-orange-400" />
                  <h3 className="text-xl font-semibold text-white">Popular Destinations</h3>
                </div>
                <div className="h-64">
                  <Bar 
                    data={prepareChartData().popularCities} 
                    options={{
                      ...chartOptions,
                      scales: {
                        x: {
                          ticks: { color: 'rgba(255, 255, 255, 0.8)' },
                          grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                          ticks: { color: 'rgba(255, 255, 255, 0.8)' },
                          grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>

            {/* Monthly Trends Line Chart - Full Width */}
            <div className="bg-white/[0.08] backdrop-blur-md border border-white/30 rounded-xl p-6 shadow-lg shadow-black/10">
              <div className="flex items-center gap-3 mb-6">
                <LineChart className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-semibold text-white">Monthly Trends</h3>
              </div>
              <div className="h-80">
                <Line 
                  data={prepareChartData().monthlyTrends} 
                  options={{
                    ...chartOptions,
                    scales: {
                      x: {
                        ticks: { color: 'rgba(255, 255, 255, 0.8)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                      },
                      y: {
                        ticks: { color: 'rgba(255, 255, 255, 0.8)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                      }
                    }
                  }} 
                />
              </div>
            </div>

            {/* Additional Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Platform Stats */}
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-blue-500/30 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <h4 className="text-white font-semibold">Platform Activity</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/70 text-sm">Total Users</span>
                    <span className="text-white font-semibold">{formatNumber(dashboardData?.totalUsers || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70 text-sm">Active Users</span>
                    <span className="text-white font-semibold">{formatNumber(dashboardData?.activeUsers || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70 text-sm">Total Trips</span>
                    <span className="text-white font-semibold">{formatNumber(dashboardData?.totalTrips || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Revenue Stats */}
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-green-500/30 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h4 className="text-white font-semibold">Revenue Metrics</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/70 text-sm">Avg Trip Cost</span>
                    <span className="text-white font-semibold">₹{formatNumber(dashboardData?.avgTripCost || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70 text-sm">Total Revenue</span>
                    <span className="text-white font-semibold">₹{formatNumber(dashboardData?.totalRevenue || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70 text-sm">Growth Rate</span>
                    <span className="text-green-400 font-semibold">+{dashboardData?.growthRate || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md border border-orange-500/30 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-orange-400" />
                  <h4 className="text-white font-semibold">User Engagement</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/70 text-sm">Avg Session</span>
                    <span className="text-white font-semibold">{dashboardData?.avgSessionTime || 0}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70 text-sm">Bounce Rate</span>
                    <span className="text-white font-semibold">{dashboardData?.bounceRate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70 text-sm">Retention</span>
                    <span className="text-orange-400 font-semibold">{dashboardData?.retentionRate || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <h4 className="text-white font-semibold">Performance</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/70 text-sm">Success Rate</span>
                    <span className="text-white font-semibold">{dashboardData?.successRate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70 text-sm">Error Rate</span>
                    <span className="text-white font-semibold">{dashboardData?.errorRate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70 text-sm">Uptime</span>
                    <span className="text-purple-400 font-semibold">{dashboardData?.uptime || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </VantaGlobe>
  );
};

export default AdminDashboard;
