const express = require('express');
const prisma = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all cities with filtering and search
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      region, 
      costLevel, 
      popularity,
      limit = 20,
      offset = 0
    } = req.query;

    let whereClause = {};

    // Search by name or country
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filter by region (country grouping)
    if (region) {
      const regionCountries = getRegionCountries(region);
      whereClause.country = { in: regionCountries };
    }

    // Filter by cost level
    if (costLevel) {
      const costRanges = getCostRanges(costLevel);
      whereClause.costIndex = {
        gte: costRanges.min,
        lte: costRanges.max
      };
    }

    // Filter by popularity
    if (popularity) {
      whereClause.popularity = {
        gte: parseFloat(popularity)
      };
    }

    const cities = await prisma.city.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            activities: true,
            stops: true
          }
        }
      },
      orderBy: { popularity: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Get total count for pagination
    const totalCount = await prisma.city.count({ where: whereClause });

    res.json({
      cities,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < totalCount
      }
    });
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single city with activities
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const city = await prisma.city.findUnique({
      where: { id: parseInt(id) },
      include: {
        activities: {
          orderBy: { popularity: 'desc' }
        },
        _count: {
          select: {
            activities: true,
            stops: true
          }
        }
      }
    });

    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }

    res.json({ city });
  } catch (error) {
    console.error('Get city error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get popular cities
router.get('/popular/list', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const cities = await prisma.city.findMany({
      orderBy: { popularity: 'desc' },
      take: parseInt(limit),
      select: {
        id: true,
        name: true,
        country: true,
        costIndex: true,
        popularity: true,
        imageUrl: true
      }
    });

    res.json({ cities });
  } catch (error) {
    console.error('Get popular cities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get cities by region
router.get('/region/:region', async (req, res) => {
  try {
    const { region } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const regionCountries = getRegionCountries(region);
    
    if (!regionCountries.length) {
      return res.status(400).json({ error: 'Invalid region' });
    }

    const cities = await prisma.city.findMany({
      where: {
        country: { in: regionCountries }
      },
      orderBy: { popularity: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const totalCount = await prisma.city.count({
      where: {
        country: { in: regionCountries }
      }
    });

    res.json({
      cities,
      region,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < totalCount
      }
    });
  } catch (error) {
    console.error('Get cities by region error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get cities by cost level
router.get('/cost/:level', async (req, res) => {
  try {
    const { level } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const costRanges = getCostRanges(level);
    
    if (!costRanges) {
      return res.status(400).json({ error: 'Invalid cost level' });
    }

    const cities = await prisma.city.findMany({
      where: {
        costIndex: {
          gte: costRanges.min,
          lte: costRanges.max
        }
      },
      orderBy: { popularity: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const totalCount = await prisma.city.count({
      where: {
        costIndex: {
          gte: costRanges.min,
          lte: costRanges.max
        }
      }
    });

    res.json({
      cities,
      costLevel: level,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < totalCount
      }
    });
  } catch (error) {
    console.error('Get cities by cost error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get city statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalCities = await prisma.city.count();
    
    const avgCostIndex = await prisma.city.aggregate({
      _avg: { costIndex: true }
    });

    const avgPopularity = await prisma.city.aggregate({
      _avg: { popularity: true }
    });

    const mostPopularCity = await prisma.city.findFirst({
      orderBy: { popularity: 'desc' },
      select: {
        id: true,
        name: true,
        country: true,
        popularity: true
      }
    });

    const leastExpensiveCity = await prisma.city.findFirst({
      orderBy: { costIndex: 'asc' },
      select: {
        id: true,
        name: true,
        country: true,
        costIndex: true
      }
    });

    res.json({
      totalCities,
      averageCostIndex: avgCostIndex._avg.costIndex,
      averagePopularity: avgPopularity._avg.popularity,
      mostPopularCity,
      leastExpensiveCity
    });
  } catch (error) {
    console.error('Get city stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
function getRegionCountries(region) {
  const regions = {
    'Europe': ['France', 'Germany', 'Italy', 'Spain', 'United Kingdom', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Czech Republic', 'Hungary', 'Portugal', 'Greece', 'Ireland', 'Iceland'],
    'Asia': ['Japan', 'China', 'South Korea', 'Thailand', 'Vietnam', 'Singapore', 'Malaysia', 'Indonesia', 'Philippines', 'India', 'Nepal', 'Cambodia', 'Laos', 'Myanmar', 'Taiwan', 'Hong Kong'],
    'North America': ['United States', 'Canada', 'Mexico'],
    'South America': ['Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Ecuador', 'Uruguay', 'Paraguay', 'Bolivia'],
    'Africa': ['South Africa', 'Egypt', 'Morocco', 'Kenya', 'Tanzania', 'Uganda', 'Ghana', 'Nigeria', 'Ethiopia', 'Rwanda'],
    'Oceania': ['Australia', 'New Zealand', 'Fiji', 'Vanuatu', 'Papua New Guinea']
  };
  
  return regions[region] || [];
}

function getCostRanges(level) {
  const ranges = {
    'low': { min: 0, max: 50 },
    'medium': { min: 51, max: 100 },
    'high': { min: 101, max: 200 }
  };
  
  return ranges[level.toLowerCase()];
}

module.exports = router; 