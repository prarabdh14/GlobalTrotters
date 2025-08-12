const express = require('express');
const prisma = require('../config/database');
const { auth } = require('../middleware/auth');
const { validateTrip, validateTripStop } = require('../middleware/validation');
const { sendItineraryEmail, sendTripUpdateEmail } = require('../utils/emailService');

const router = express.Router();

// Get all trips for current user
router.get('/', auth, async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let whereClause = { userId: req.user.id };
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const trips = await prisma.trip.findMany({
      where: whereClause,
      include: {
        stops: {
          include: {
            city: true
          },
          orderBy: { orderNum: 'asc' }
        },
        budgetItems: true,
        _count: {
          select: {
            stops: true,
            activities: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filter by status if provided
    let filteredTrips = trips;
    if (status && status !== 'all') {
      const now = new Date();
      filteredTrips = trips.filter(trip => {
        const startDate = new Date(trip.startDate);
        const endDate = new Date(trip.endDate);
        
        switch (status) {
          case 'upcoming':
            return startDate > now;
          case 'ongoing':
            return startDate <= now && endDate >= now;
          case 'completed':
            return endDate < now;
          case 'planning':
            return trip._count.stops === 0;
          default:
            return true;
        }
      });
    }

    res.json({ trips: filteredTrips });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single trip with full details
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      },
      include: {
        stops: {
          include: {
            city: true,
            activities: {
              include: {
                activity: true
              },
              orderBy: { startTime: 'asc' }
            }
          },
          orderBy: { orderNum: 'asc' }
        },
        budgetItems: true,
        sharedTrip: true
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json({ trip });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new trip
router.post('/', auth, validateTrip, async (req, res) => {
  try {
    const { name, description, startDate, endDate, coverImg } = req.body;

    const trip = await prisma.trip.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        coverImg,
        userId: req.user.id
      },
      include: {
        stops: {
          include: {
            city: true
          }
        }
      }
    });

    // Send email notification
    try {
      await sendTripUpdateEmail(req.user, trip, 'created');
    } catch (emailError) {
      console.error('Failed to send trip creation email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: 'Trip created successfully',
      trip
    });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update trip
router.put('/:id', auth, validateTrip, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, coverImg } = req.body;

    const trip = await prisma.trip.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        coverImg
      },
      include: {
        stops: {
          include: {
            city: true
          }
        }
      }
    });

    // Send email notification
    try {
      await sendTripUpdateEmail(req.user, updatedTrip, 'updated');
    } catch (emailError) {
      console.error('Failed to send trip update email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      message: 'Trip updated successfully',
      trip: updatedTrip
    });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send detailed itinerary email
router.post('/:id/send-itinerary', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      },
      include: {
        stops: {
          include: {
            city: true,
            activities: {
              include: {
                activity: true
              },
              orderBy: { startTime: 'asc' }
            }
          },
          orderBy: { orderNum: 'asc' }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Send detailed itinerary email
    const emailResult = await sendItineraryEmail(req.user, trip, trip.stops);

    if (emailResult.success) {
      res.json({
        message: 'Itinerary email sent successfully',
        messageId: emailResult.messageId
      });
    } else {
      res.status(500).json({
        error: 'Failed to send itinerary email',
        details: emailResult.error
      });
    }
  } catch (error) {
    console.error('Send itinerary email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete trip
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    await prisma.trip.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add stop to trip
router.post('/:id/stops', auth, validateTripStop, async (req, res) => {
  try {
    const { id } = req.params;
    const { cityId, startDate, endDate, orderNum } = req.body;

    // Verify trip belongs to user
    const trip = await prisma.trip.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const stop = await prisma.tripStop.create({
      data: {
        tripId: parseInt(id),
        cityId: parseInt(cityId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        orderNum: parseInt(orderNum)
      },
      include: {
        city: true
      }
    });

    res.status(201).json({
      message: 'Stop added successfully',
      stop
    });
  } catch (error) {
    console.error('Add stop error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update trip stop
router.put('/:tripId/stops/:stopId', auth, validateTripStop, async (req, res) => {
  try {
    const { tripId, stopId } = req.params;
    const { cityId, startDate, endDate, orderNum } = req.body;

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

    const stop = await prisma.tripStop.update({
      where: { id: parseInt(stopId) },
      data: {
        cityId: parseInt(cityId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        orderNum: parseInt(orderNum)
      },
      include: {
        city: true
      }
    });

    res.json({
      message: 'Stop updated successfully',
      stop
    });
  } catch (error) {
    console.error('Update stop error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete trip stop
router.delete('/:tripId/stops/:stopId', auth, async (req, res) => {
  try {
    const { tripId, stopId } = req.params;

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

    await prisma.tripStop.delete({
      where: { id: parseInt(stopId) }
    });

    res.json({ message: 'Stop deleted successfully' });
  } catch (error) {
    console.error('Delete stop error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add activity to trip stop
router.post('/:tripId/stops/:stopId/activities', auth, async (req, res) => {
  try {
    const { tripId, stopId } = req.params;
    const { activityId, date, startTime, note } = req.body;

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

    const tripActivity = await prisma.tripActivity.create({
      data: {
        tripId: parseInt(tripId),
        stopId: parseInt(stopId),
        activityId: parseInt(activityId),
        date: new Date(date),
        startTime: new Date(startTime),
        note
      },
      include: {
        activity: true
      }
    });

    res.status(201).json({
      message: 'Activity added successfully',
      tripActivity
    });
  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update trip activity
router.put('/:tripId/activities/:activityId', auth, async (req, res) => {
  try {
    const { tripId, activityId } = req.params;
    const { date, startTime, note } = req.body;

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

    const tripActivity = await prisma.tripActivity.update({
      where: { id: parseInt(activityId) },
      data: {
        date: new Date(date),
        startTime: new Date(startTime),
        note
      },
      include: {
        activity: true
      }
    });

    res.json({
      message: 'Activity updated successfully',
      tripActivity
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete trip activity
router.delete('/:tripId/activities/:activityId', auth, async (req, res) => {
  try {
    const { tripId, activityId } = req.params;

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

    await prisma.tripActivity.delete({
      where: { id: parseInt(activityId) }
    });

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 