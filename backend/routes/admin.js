const express = require('express');
const prisma = require('../config/database');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get platform overview statistics
router.get('/overview', adminAuth, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalTrips = await prisma.trip.count();
    const totalCities = await prisma.city.count();
    const totalActivities = await prisma.activity.count();

    // Get recent activity
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    const recentTrips = await prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Calculate growth metrics
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastYear = new Date(now.getFullYear() - 1, 0, 1);

    const usersThisMonth = await prisma.user.count({
      where: { createdAt: { gte: lastMonth } }
    });

    const tripsThisMonth = await prisma.trip.count({
      where: { createdAt: { gte: lastMonth } }
    });

    const usersThisYear = await prisma.user.count({
      where: { createdAt: { gte: lastYear } }
    });

    const tripsThisYear = await prisma.trip.count({
      where: { createdAt: { gte: lastYear } }
    });

    res.json({
      overview: {
        totalUsers,
        totalTrips,
        totalCities,
        totalActivities,
        usersThisMonth,
        tripsThisMonth,
        usersThisYear,
        tripsThisYear
      },
      recentActivity: {
        users: recentUsers,
        trips: recentTrips
      }
    });
  } catch (error) {
    console.error('Get admin overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user management data
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { search, limit = 20, offset = 0 } = req.query;

    let whereClause = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            trips: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const totalUsers = await prisma.user.count({ where: whereClause });

    res.json({
      users,
      pagination: {
        total: totalUsers,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < totalUsers
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user details
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        trips: {
          include: {
            stops: {
              include: {
                city: true
              }
            },
            budgetItems: true
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            trips: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate user statistics
    const totalBudget = user.trips.reduce((sum, trip) => {
      return sum + trip.budgetItems.reduce((tripSum, item) => tripSum + item.amount, 0);
    }, 0);

    const visitedCities = new Set();
    const visitedCountries = new Set();
    
    user.trips.forEach(trip => {
      trip.stops.forEach(stop => {
        visitedCities.add(stop.city.name);
        visitedCountries.add(stop.city.country);
      });
    });

    res.json({
      user,
      statistics: {
        totalTrips: user._count.trips,
        totalBudget,
        visitedCities: Array.from(visitedCities).length,
        visitedCountries: Array.from(visitedCountries).length,
        averageBudgetPerTrip: user._count.trips > 0 ? totalBudget / user._count.trips : 0
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get platform analytics
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    let dateFilter = {};
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }

    dateFilter = {
      createdAt: {
        gte: startDate
      }
    };

    // Get user growth
    const newUsers = await prisma.user.count({
      where: dateFilter
    });

    // Get trip creation
    const newTrips = await prisma.trip.count({
      where: dateFilter
    });

    // Get popular destinations
    const popularDestinations = await prisma.tripStop.groupBy({
      by: ['cityId'],
      _count: { cityId: true },
      orderBy: {
        _count: {
          cityId: 'desc'
        }
      },
      take: 10
    });

    const destinationsWithDetails = await Promise.all(
      popularDestinations.map(async (dest) => {
        const city = await prisma.city.findUnique({
          where: { id: dest.cityId },
          select: { name: true, country: true }
        });
        return {
          city,
          tripCount: dest._count.cityId
        };
      })
    );

    // Get activity types distribution
    const activityTypes = await prisma.activity.groupBy({
      by: ['type'],
      _count: { type: true }
    });

    // Get budget statistics
    const budgetStats = await prisma.budgetItem.aggregate({
      _avg: { amount: true },
      _sum: { amount: true },
      _count: { amount: true }
    });

    res.json({
      period,
      growth: {
        newUsers,
        newTrips
      },
      popularDestinations: destinationsWithDetails,
      activityTypes: activityTypes.map(type => ({
        type: type.type,
        count: type._count.type
      })),
      budgetStats: {
        averageAmount: budgetStats._avg.amount,
        totalAmount: budgetStats._sum.amount,
        totalItems: budgetStats._count.amount
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get monthly performance data
router.get('/analytics/monthly', adminAuth, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const monthlyData = [];
    
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(parseInt(year), month, 1);
      const endDate = new Date(parseInt(year), month + 1, 0);

      const users = await prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      const trips = await prisma.trip.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      const budgetTotal = await prisma.budgetItem.aggregate({
        where: {
          trip: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        _sum: { amount: true }
      });

      monthlyData.push({
        month: startDate.toLocaleString('default', { month: 'long' }),
        users,
        trips,
        revenue: budgetTotal._sum.amount || 0
      });
    }

    res.json({ monthlyData, year: parseInt(year) });
  } catch (error) {
    console.error('Get monthly analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 