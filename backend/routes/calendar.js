const express = require('express');
const { google } = require('googleapis');
const prisma = require('../config/database');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Google Calendar OAuth2 setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Get Google Calendar authorization URL
router.get('/auth-url', auth, async (req, res) => {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
});

// Handle Google Calendar OAuth callback
router.get('/callback', auth, async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens in user record
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null
      }
    });

    res.json({ message: 'Google Calendar connected successfully' });
  } catch (error) {
    console.error('Calendar OAuth error:', error);
    res.status(500).json({ error: 'Failed to connect Google Calendar' });
  }
});

// Add trip to Google Calendar
router.post('/add-trip', auth, async (req, res) => {
  try {
    const { tripId } = req.body;
    
    // Get user with tokens
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user.googleAccessToken) {
      return res.status(400).json({ error: 'Google Calendar not connected' });
    }

    // Get trip details
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: req.user.id },
      include: { stops: { include: { city: true } } }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Set up Google Calendar client
    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Create calendar event for the trip
    const event = {
      summary: `Trip: ${trip.name}`,
      description: trip.description,
      start: {
        dateTime: trip.startDate.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: trip.endDate.toISOString(),
        timeZone: 'UTC',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 60 }, // 1 hour before
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    res.json({
      message: 'Trip added to Google Calendar',
      eventId: response.data.id,
      eventUrl: response.data.htmlLink
    });

  } catch (error) {
    console.error('Error adding trip to calendar:', error);
    res.status(500).json({ error: 'Failed to add trip to Google Calendar' });
  }
});

// Get user's Google Calendar events
router.get('/events', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user.googleAccessToken) {
      return res.status(400).json({ error: 'Google Calendar not connected' });
    }

    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    res.json({ events: response.data.items });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

module.exports = router; 