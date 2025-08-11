const express = require('express');
const prisma = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all activities with filtering and search
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      type, 
      cost, 
      duration,
      cityId,
      limit = 20,
      offset = 0
    } = req.query;

    let whereClause = {};

    // Search by name or description
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filter by type
    if (type) {
      whereClause.type = type;
    }

    // Filter by cost range
    if (cost) {
      const costRanges = getCostRanges(cost);
      whereClause.cost = {
        gte: costRanges.min,
        lte: costRanges.max
      };
    }

    // Filter by duration range
    if (duration) {
      const durationRanges = getDurationRanges(duration);
      whereClause.duration = {
        gte: durationRanges.min,
        lte: durationRanges.max
      };
    }

    // Filter by city
    if (cityId) {
      whereClause.cityId = parseInt(cityId);
    }

    const activities = await prisma.activity.findMany({
      where: whereClause,
      include: {
        city: {
          select: {
            id: true,
            name: true,
            country: true
          }
        }
      },
      orderBy: { cost: 'asc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Get total count for pagination
    const totalCount = await prisma.activity.count({ where: whereClause });

    res.json({
      activities,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < totalCount
      }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single activity
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(id) },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            country: true,
            costIndex: true
          }
        }
      }
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json({ activity });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get activities by city
router.get('/city/:cityId', async (req, res) => {
  try {
    const { cityId } = req.params;
    const { type, cost, duration, limit = 20, offset = 0 } = req.query;

    let whereClause = { cityId: parseInt(cityId) };

    if (type) {
      whereClause.type = type;
    }

    if (cost) {
      const costRanges = getCostRanges(cost);
      whereClause.cost = {
        gte: costRanges.min,
        lte: costRanges.max
      };
    }

    if (duration) {
      const durationRanges = getDurationRanges(duration);
      whereClause.duration = {
        gte: durationRanges.min,
        lte: durationRanges.max
      };
    }

    const activities = await prisma.activity.findMany({
      where: whereClause,
      orderBy: { cost: 'asc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const totalCount = await prisma.activity.count({ where: whereClause });

    res.json({
      activities,
      cityId: parseInt(cityId),
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < totalCount
      }
    });
  } catch (error) {
    console.error('Get activities by city error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get activities by type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const activities = await prisma.activity.findMany({
      where: { type },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            country: true
          }
        }
      },
      orderBy: { cost: 'asc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const totalCount = await prisma.activity.count({ where: { type } });

    res.json({
      activities,
      type,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < totalCount
      }
    });
  } catch (error) {
    console.error('Get activities by type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get popular activities
router.get('/popular/list', async (req, res) => {
  try {
    const { limit = 10, cityId } = req.query;

    let whereClause = {};
    if (cityId) {
      whereClause.cityId = parseInt(cityId);
    }

    const activities = await prisma.activity.findMany({
      where: whereClause,
      include: {
        city: {
          select: {
            id: true,
            name: true,
            country: true
          }
        }
      },
      orderBy: { cost: 'asc' },
      take: parseInt(limit)
    });

    res.json({ activities });
  } catch (error) {
    console.error('Get popular activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get activity types
router.get('/types/list', async (req, res) => {
  try {
    const types = await prisma.activity.findMany({
      select: { type: true },
      distinct: ['type']
    });

    const typeList = types.map(t => t.type).sort();

    res.json({ types: typeList });
  } catch (error) {
    console.error('Get activity types error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get activity statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalActivities = await prisma.activity.count();
    
    const avgCost = await prisma.activity.aggregate({
      _avg: { cost: true }
    });

    const avgDuration = await prisma.activity.aggregate({
      _avg: { duration: true }
    });

    const activityTypes = await prisma.activity.groupBy({
      by: ['type'],
      _count: { type: true }
    });

    const mostExpensiveActivity = await prisma.activity.findFirst({
      orderBy: { cost: 'desc' },
      include: {
        city: {
          select: {
            name: true,
            country: true
          }
        }
      }
    });

    const leastExpensiveActivity = await prisma.activity.findFirst({
      orderBy: { cost: 'asc' },
      include: {
        city: {
          select: {
            name: true,
            country: true
          }
        }
      }
    });

    res.json({
      totalActivities,
      averageCost: avgCost._avg.cost,
      averageDuration: avgDuration._avg.duration,
      activityTypes: activityTypes.map(type => ({
        type: type.type,
        count: type._count.type
      })),
      mostExpensiveActivity,
      leastExpensiveActivity
    });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
function getCostRanges(level) {
  const ranges = {
    'low': { min: 0, max: 30 },
    'medium': { min: 31, max: 80 },
    'high': { min: 81, max: 1000 }
  };
  
  return ranges[level.toLowerCase()];
}

function getDurationRanges(level) {
  const ranges = {
    'short': { min: 0, max: 120 }, // 0-2 hours
    'medium': { min: 121, max: 240 }, // 2-4 hours
    'long': { min: 241, max: 1440 } // 4+ hours
  };
  
  return ranges[level.toLowerCase()];
}

module.exports = router; 