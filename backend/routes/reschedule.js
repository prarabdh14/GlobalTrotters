const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation for reschedule request
const validateReschedule = [
  body('tripId').isInt().withMessage('Valid trip ID is required'),
  body('newStartDate').isISO8601().withMessage('Valid new start date is required'),
  body('newEndDate').isISO8601().withMessage('Valid new end date is required'),
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

// Check if trip can be rescheduled (24 hours before start)
router.get('/check/:tripId', auth, async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;
    
    console.log('Reschedule check request:', { tripId, userId });

    const trip = await prisma.trip.findFirst({
      where: {
        id: parseInt(tripId),
        userId: userId
      },
      include: {
        stops: {
          include: {
            city: true
          },
          orderBy: {
            startDate: 'asc'
          }
        },
        budgetItems: true
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const now = new Date();
    const tripStart = new Date(trip.startDate);
    const hoursUntilTrip = (tripStart - now) / (1000 * 60 * 60);

    // Check if trip is within 24 hours
    const canReschedule = hoursUntilTrip > 24;
    
    // Calculate used budget
    const usedBudget = trip.budgetItems.reduce((sum, item) => sum + item.amount, 0);

    // Get upcoming stops (not yet passed)
    const upcomingStops = trip.stops.filter(stop => new Date(stop.startDate) > now);

    const response = {
      canReschedule,
      hoursUntilTrip: Math.floor(hoursUntilTrip),
      trip,
      usedBudget,
      upcomingStops,
      totalBudget: trip.budgetItems.reduce((sum, item) => sum + item.amount, 0)
    };
    
    console.log('Sending reschedule check response:', response);
    res.json(response);

  } catch (error) {
    console.error('Check reschedule error:', error);
    res.status(500).json({ error: 'Failed to check reschedule availability' });
  }
});

// Reschedule trip
router.post('/trip', auth, validateReschedule, async (req, res) => {
  try {
    const { tripId, newStartDate, newEndDate, reason } = req.body;
    const userId = req.user.id;

    // Get the trip
    const trip = await prisma.trip.findFirst({
      where: {
        id: parseInt(tripId),
        userId: userId
      },
      include: {
        stops: {
          include: {
            city: true
          },
          orderBy: {
            startDate: 'asc'
          }
        },
        budgetItems: true
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Check if trip can be rescheduled
    const now = new Date();
    const tripStart = new Date(trip.startDate);
    const hoursUntilTrip = (tripStart - now) / (1000 * 60 * 60);

    if (hoursUntilTrip <= 24) {
      return res.status(400).json({ 
        error: 'Cannot reschedule trip within 24 hours of start date' 
      });
    }

    // Calculate used budget and remaining budget
    const usedBudget = trip.budgetItems.reduce((sum, item) => sum + item.amount, 0);
    const totalBudget = trip.budgetItems.reduce((sum, item) => sum + item.amount, 0);
    const remainingBudget = totalBudget - usedBudget;

    // Calculate new trip duration
    const newStart = new Date(newStartDate);
    const newEnd = new Date(newEndDate);
    const newDuration = Math.ceil((newEnd - newStart) / (1000 * 60 * 60 * 24));

    // Update trip with new dates
    const updatedTrip = await prisma.trip.update({
      where: { id: parseInt(tripId) },
      data: {
        startDate: newStart,
        endDate: newEnd,
        status: 'rescheduled',
        originalStartDate: trip.startDate,
        originalEndDate: trip.endDate,
        rescheduledAt: now
      }
    });

    // Delete existing stops and activities for the rescheduled period
    await prisma.tripActivity.deleteMany({
      where: {
        stop: {
          tripId: parseInt(tripId)
        }
      }
    });

    await prisma.tripStop.deleteMany({
      where: {
        tripId: parseInt(tripId)
      }
    });

    // Create new budget item for rescheduling
    await prisma.budgetItem.create({
      data: {
        tripId: parseInt(tripId),
        category: 'reschedule',
        amount: 0, // No additional cost for rescheduling
        details: `Trip rescheduled from ${trip.startDate.toDateString()} to ${newStartDate}. Reason: ${reason || 'No reason provided'}`
      }
    });

    res.json({
      message: 'Trip rescheduled successfully',
      trip: updatedTrip,
      remainingBudget,
      newDuration,
      usedBudget
    });

  } catch (error) {
    console.error('Reschedule trip error:', error);
    res.status(500).json({ error: 'Failed to reschedule trip' });
  }
});

// Get reschedule history for a trip
router.get('/history/:tripId', auth, async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    const trip = await prisma.trip.findFirst({
      where: {
        id: parseInt(tripId),
        userId: userId
      },
      include: {
        budgetItems: {
          where: {
            category: 'reschedule'
          },
          orderBy: {
            id: 'desc'
          }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json({
      trip,
      rescheduleHistory: trip.budgetItems
    });

  } catch (error) {
    console.error('Get reschedule history error:', error);
    res.status(500).json({ error: 'Failed to get reschedule history' });
  }
});

module.exports = router; 