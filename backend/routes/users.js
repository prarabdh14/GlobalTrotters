const express = require('express');
const prisma = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        profileImg: true,
        language: true,
        createdAt: true
      }
    });

    res.json({ user });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, language, profileImg } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name || undefined,
        language: language || undefined,
        profileImg: profileImg || undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImg: true,
        language: true,
        createdAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { period = 'all' } = req.query;

    let dateFilter = {};
    if (period !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      
      dateFilter = {
        createdAt: {
          gte: startDate
        }
      };
    }

    // Get trip statistics
    const trips = await prisma.trip.findMany({
      where: {
        userId: req.user.id,
        ...dateFilter
      },
      include: {
        stops: {
          include: {
            city: true
          }
        },
        budgetItems: true
      }
    });

    // Calculate statistics
    const totalTrips = trips.length;
    const totalBudget = trips.reduce((sum, trip) => {
      return sum + trip.budgetItems.reduce((tripSum, item) => tripSum + item.amount, 0);
    }, 0);

    const visitedCities = new Set();
    const visitedCountries = new Set();
    
    trips.forEach(trip => {
      trip.stops.forEach(stop => {
        visitedCities.add(stop.city.name);
        visitedCountries.add(stop.city.country);
      });
    });

    const upcomingTrips = trips.filter(trip => {
      const startDate = new Date(trip.startDate);
      return startDate > new Date();
    }).length;

    const completedTrips = trips.filter(trip => {
      const endDate = new Date(trip.endDate);
      return endDate < new Date();
    }).length;

    const planningTrips = trips.filter(trip => {
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);
      const now = new Date();
      return startDate > now && endDate > now;
    }).length;

    res.json({
      period,
      totalTrips,
      totalBudget,
      visitedCities: Array.from(visitedCities).length,
      visitedCountries: Array.from(visitedCountries).length,
      upcomingTrips,
      completedTrips,
      planningTrips,
      averageBudgetPerTrip: totalTrips > 0 ? totalBudget / totalTrips : 0
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's travel history
router.get('/travel-history', auth, async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const trips = await prisma.trip.findMany({
      where: { userId: req.user.id },
      include: {
        stops: {
          include: {
            city: true
          },
          orderBy: { orderNum: 'asc' }
        },
        budgetItems: true
      },
      orderBy: { startDate: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const totalTrips = await prisma.trip.count({
      where: { userId: req.user.id }
    });

    res.json({
      trips,
      pagination: {
        total: totalTrips,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < totalTrips
      }
    });
  } catch (error) {
    console.error('Get travel history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's favorite destinations
router.get('/favorite-destinations', auth, async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.user.id },
      include: {
        stops: {
          include: {
            city: true
          }
        }
      }
    });

    // Count city visits
    const cityVisits = {};
    trips.forEach(trip => {
      trip.stops.forEach(stop => {
        const cityKey = `${stop.city.name}, ${stop.city.country}`;
        if (!cityVisits[cityKey]) {
          cityVisits[cityKey] = {
            city: stop.city,
            visitCount: 0
          };
        }
        cityVisits[cityKey].visitCount++;
      });
    });

    // Sort by visit count and get top destinations
    const favoriteDestinations = Object.values(cityVisits)
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, 10);

    res.json({ favoriteDestinations });
  } catch (error) {
    console.error('Get favorite destinations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's travel timeline
router.get('/travel-timeline', auth, async (req, res) => {
  try {
    const { year } = req.query;

    let dateFilter = {};
    if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31);
      dateFilter = {
        startDate: {
          gte: startDate,
          lte: endDate
        }
      };
    }

    const trips = await prisma.trip.findMany({
      where: {
        userId: req.user.id,
        ...dateFilter
      },
      include: {
        stops: {
          include: {
            city: true
          },
          orderBy: { orderNum: 'asc' }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    // Group trips by month
    const timeline = trips.reduce((acc, trip) => {
      const month = new Date(trip.startDate).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(trip);
      return acc;
    }, {});

    res.json({ timeline });
  } catch (error) {
    console.error('Get travel timeline error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user account
router.delete('/account', auth, async (req, res) => {
  try {
    // Delete all user data (trips, budget items, etc.)
    await prisma.user.delete({
      where: { id: req.user.id }
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 