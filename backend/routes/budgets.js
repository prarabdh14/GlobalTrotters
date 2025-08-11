const express = require('express');
const prisma = require('../config/database');
const { auth } = require('../middleware/auth');
const { validateBudgetItem } = require('../middleware/validation');

const router = express.Router();

// Get budget items for a trip
router.get('/trip/:tripId', auth, async (req, res) => {
  try {
    const { tripId } = req.params;

    // Verify trip belongs to user
    const trip = await prisma.trip.findFirst({
      where: {
        id: parseInt(tripId),
        userId: req.user.id
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const budgetItems = await prisma.budgetItem.findMany({
      where: { tripId: parseInt(tripId) },
      orderBy: { id: 'desc' }
    });

    // Calculate budget summary
    const totalBudget = budgetItems.reduce((sum, item) => sum + item.amount, 0);
    
    const budgetByCategory = budgetItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = 0;
      }
      acc[item.category] += item.amount;
      return acc;
    }, {});

    res.json({
      budgetItems,
      summary: {
        totalBudget,
        totalItems: budgetItems.length,
        byCategory: budgetByCategory
      }
    });
  } catch (error) {
    console.error('Get budget items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add budget item to trip
router.post('/trip/:tripId', auth, validateBudgetItem, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { category, amount, details } = req.body;

    // Verify trip belongs to user
    const trip = await prisma.trip.findFirst({
      where: {
        id: parseInt(tripId),
        userId: req.user.id
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const budgetItem = await prisma.budgetItem.create({
      data: {
        tripId: parseInt(tripId),
        category,
        amount: parseFloat(amount),
        details
      }
    });

    res.status(201).json({
      message: 'Budget item added successfully',
      budgetItem
    });
  } catch (error) {
    console.error('Add budget item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update budget item
router.put('/:id', auth, validateBudgetItem, async (req, res) => {
  try {
    const { id } = req.params;
    const { category, amount, details } = req.body;

    // Find budget item and verify trip belongs to user
    const budgetItem = await prisma.budgetItem.findFirst({
      where: { id: parseInt(id) },
      include: {
        trip: {
          select: { userId: true }
        }
      }
    });

    if (!budgetItem) {
      return res.status(404).json({ error: 'Budget item not found' });
    }

    if (budgetItem.trip.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedBudgetItem = await prisma.budgetItem.update({
      where: { id: parseInt(id) },
      data: {
        category,
        amount: parseFloat(amount),
        details
      }
    });

    res.json({
      message: 'Budget item updated successfully',
      budgetItem: updatedBudgetItem
    });
  } catch (error) {
    console.error('Update budget item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete budget item
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find budget item and verify trip belongs to user
    const budgetItem = await prisma.budgetItem.findFirst({
      where: { id: parseInt(id) },
      include: {
        trip: {
          select: { userId: true }
        }
      }
    });

    if (!budgetItem) {
      return res.status(404).json({ error: 'Budget item not found' });
    }

    if (budgetItem.trip.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.budgetItem.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Budget item deleted successfully' });
  } catch (error) {
    console.error('Delete budget item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get budget summary for a trip
router.get('/trip/:tripId/summary', auth, async (req, res) => {
  try {
    const { tripId } = req.params;

    // Verify trip belongs to user
    const trip = await prisma.trip.findFirst({
      where: {
        id: parseInt(tripId),
        userId: req.user.id
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const budgetItems = await prisma.budgetItem.findMany({
      where: { tripId: parseInt(tripId) }
    });

    // Calculate summary
    const totalBudget = budgetItems.reduce((sum, item) => sum + item.amount, 0);
    
    const budgetByCategory = budgetItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = {
          total: 0,
          items: []
        };
      }
      acc[item.category].total += item.amount;
      acc[item.category].items.push(item);
      return acc;
    }, {});

    // Calculate percentages
    const categoryPercentages = Object.keys(budgetByCategory).map(category => ({
      category,
      total: budgetByCategory[category].total,
      percentage: totalBudget > 0 ? (budgetByCategory[category].total / totalBudget) * 100 : 0,
      itemCount: budgetByCategory[category].items.length
    }));

    res.json({
      tripId: parseInt(tripId),
      totalBudget,
      totalItems: budgetItems.length,
      byCategory: budgetByCategory,
      categoryPercentages,
      averagePerItem: budgetItems.length > 0 ? totalBudget / budgetItems.length : 0
    });
  } catch (error) {
    console.error('Get budget summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get budget statistics for user
router.get('/user/stats', auth, async (req, res) => {
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
        trip: {
          createdAt: {
            gte: startDate
          }
        }
      };
    }

    const budgetItems = await prisma.budgetItem.findMany({
      where: {
        trip: {
          userId: req.user.id,
          ...dateFilter.trip
        }
      },
      include: {
        trip: {
          select: {
            name: true,
            startDate: true,
            endDate: true
          }
        }
      }
    });

    const totalSpent = budgetItems.reduce((sum, item) => sum + item.amount, 0);
    
    const spendingByCategory = budgetItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = 0;
      }
      acc[item.category] += item.amount;
      return acc;
    }, {});

    const spendingByTrip = budgetItems.reduce((acc, item) => {
      const tripName = item.trip.name;
      if (!acc[tripName]) {
        acc[tripName] = 0;
      }
      acc[tripName] += item.amount;
      return acc;
    }, {});

    res.json({
      period,
      totalSpent,
      totalItems: budgetItems.length,
      averagePerItem: budgetItems.length > 0 ? totalSpent / budgetItems.length : 0,
      byCategory: spendingByCategory,
      byTrip: spendingByTrip,
      topCategories: Object.entries(spendingByCategory)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category, amount]) => ({ category, amount }))
    });
  } catch (error) {
    console.error('Get user budget stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get budget categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await prisma.budgetItem.findMany({
      select: { category: true },
      distinct: ['category']
    });

    const categoryList = categories.map(c => c.category).sort();

    res.json({ categories: categoryList });
  } catch (error) {
    console.error('Get budget categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 