const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');
const { auth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Admin login validation
const validateAdminLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    next();
  }
];

// Admin login
router.post('/login', validateAdminLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email, isActive: true }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        email: admin.email, 
        role: admin.role,
        isAdmin: true 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return admin data (excluding password)
    const { password: _, ...adminData } = admin;

    res.json({
      message: 'Admin login successful',
      admin: adminData,
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get admin dashboard stats (protected route)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await prisma.user.count();
    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    // Get trip statistics
    const totalTrips = await prisma.trip.count();
    const tripsThisMonth = await prisma.trip.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    // Get AI itinerary statistics
    const totalAiItineraries = await prisma.aiItinerary.count();
    const aiItinerariesThisMonth = await prisma.aiItinerary.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    // Get top cities
    const topCities = await prisma.city.findMany({
      take: 10,
      orderBy: {
        popularity: 'desc'
      },
      select: {
        id: true,
        name: true,
        country: true,
        popularity: true,
        costIndex: true
      }
    });

    // Get user growth over time (last 6 months) - using Prisma instead of raw SQL
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const userGrowth = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      _count: {
        id: true
      }
    });

    // Get trip growth over time (last 6 months) - using Prisma instead of raw SQL
    const tripGrowth = await prisma.trip.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      _count: {
        id: true
      }
    });

    // Get recent activity
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    const recentTrips = await prisma.trip.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Calculate additional metrics
    const activeUsers = await prisma.user.count({
      where: {
        trips: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        }
      }
    });

    // Mock metrics for demonstration (in real app, these would come from analytics)
    const avgTripCost = 25000; // Average trip cost in INR
    const totalRevenue = totalTrips * avgTripCost;
    const growthRate = 15; // Percentage growth
    const avgSessionTime = 25; // Minutes
    const bounceRate = 35; // Percentage
    const retentionRate = 68; // Percentage
    const successRate = 98; // Percentage
    const errorRate = 2; // Percentage
    const uptime = 99.9; // Percentage

    res.json({
      stats: {
        totalUsers,
        newUsersThisMonth,
        totalTrips,
        tripsThisMonth,
        totalAiItineraries,
        aiItinerariesThisMonth
      },
      // Additional metrics for analytics cards
      totalUsers,
      activeUsers,
      avgTripCost,
      totalRevenue,
      growthRate,
      avgSessionTime,
      bounceRate,
      retentionRate,
      successRate,
      errorRate,
      uptime,
      topCities,
      userGrowth,
      tripGrowth,
      recentUsers,
      recentTrips
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get all users (with pagination)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const users = await prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        isEmailVerified: true,
        googleId: true,
        _count: {
          select: {
            trips: true,
            aiItineraries: true
          }
        }
      }
    });

    const totalUsers = await prisma.user.count({ where });

    res.json({
      users,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all trips (with pagination)
router.get('/trips', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const trips = await prisma.trip.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        stops: {
          include: {
            city: {
              select: {
                name: true,
                country: true
              }
            }
          }
        }
      }
    });

    const totalTrips = await prisma.trip.count({ where });

    res.json({
      trips,
      pagination: {
        page,
        limit,
        total: totalTrips,
        pages: Math.ceil(totalTrips / limit)
      }
    });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// Get platform analytics
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    // User engagement metrics
    const activeUsers = await prisma.user.count({
      where: {
        trips: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        }
      }
    });

    // User growth data
    const totalUsers = await prisma.user.count();
    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });
    const returningUsers = await prisma.user.count({
      where: {
        trips: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    });

    // Trip status distribution
    const now = new Date();
    const planningTrips = await prisma.trip.count({
      where: {
        startDate: {
          gt: now
        }
      }
    });
    const ongoingTrips = await prisma.trip.count({
      where: {
        startDate: {
          lte: now
        },
        endDate: {
          gte: now
        }
      }
    });
    const completedTrips = await prisma.trip.count({
      where: {
        endDate: {
          lt: now
        }
      }
    });
    const cancelledTrips = await prisma.trip.count({
      where: {
        status: 'cancelled'
      }
    });

    // Popular destinations
    const popularDestinations = await prisma.tripStop.groupBy({
      by: ['cityId'],
      _count: {
        cityId: true
      },
      orderBy: {
        _count: {
          cityId: 'desc'
        }
      },
      take: 10
    });

    // Get city details for popular destinations
    const popularCities = await Promise.all(
      popularDestinations.map(async (dest) => {
        const city = await prisma.city.findUnique({
          where: { id: dest.cityId },
          select: {
            id: true,
            name: true,
            country: true,
            popularity: true,
            costIndex: true
          }
        });
        return {
          ...city,
          tripCount: dest._count.cityId
        };
      })
    );

    // Monthly trends - enhanced with user data
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const monthlyTrends = await Promise.all(
      Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        return Promise.all([
          prisma.user.count({
            where: {
              createdAt: {
                gte: startOfMonth,
                lte: endOfMonth
              }
            }
          }),
          prisma.trip.count({
            where: {
              createdAt: {
                gte: startOfMonth,
                lte: endOfMonth
              }
            }
          })
        ]).then(([unique_users, total_trips]) => ({
          month: startOfMonth.toISOString(),
          unique_users,
          total_trips
        }));
      })
    );

    // Budget distribution (mock data for now)
    const budgetDistribution = {
      transport: 30,
      accommodation: 40,
      activities: 20,
      food: 8,
      other: 2
    };

    res.json({
      activeUsers,
      popularCities,
      monthlyTrends: monthlyTrends.reverse(),
      userGrowth: {
        newUsers: newUsersThisMonth,
        returningUsers: returningUsers,
        activeUsers: activeUsers
      },
      tripStatus: {
        planning: planningTrips,
        ongoing: ongoingTrips,
        completed: completedTrips,
        cancelled: cancelledTrips
      },
      budgetDistribution
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router; 