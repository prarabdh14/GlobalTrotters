const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');
const { auth } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');

const router = express.Router();

// Google OAuth
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register new user
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
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

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user has a password (not a Google OAuth user)
    if (!user.password) {
      return res.status(401).json({ 
        error: 'This account was created with Google. Please use Google Sign-In instead.' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Generated token for user:', user.id, 'Token:', token.substring(0, 20) + '...');

    // Return user data (excluding password)
    const { password: _, ...userData } = user;

    res.json({
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth Routes
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { googleId }
        ]
      }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name,
          profileImg: picture,
          googleId,
          isEmailVerified: true
        }
      });
    } else if (!user.googleId) {
      // Link existing user with Google account
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          profileImg: picture,
          isEmailVerified: true
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImg: user.profileImg
      }
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// Google OAuth Callback Route (for redirect flow)
router.get('/google/callback', async (req, res) => {
  try {
    const { code, error } = req.query;
    
    if (error) {
      console.error('Google OAuth error:', error);
      return res.status(400).json({ error: `OAuth error: ${error}` });
    }
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    console.log('Received authorization code, exchanging for tokens...');

    // Exchange authorization code for tokens
    const { OAuth2Client } = require('google-auth-library');
    const { google } = require('googleapis');
    
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    // Get user info from Google
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2('v2');
    const userInfo = await oauth2.userinfo.get({ auth: oauth2Client });
    
    const { email, name, picture } = userInfo.data;
    const googleId = userInfo.data.id;

    console.log('User info received from Google:', { email, name, googleId });

    // Check if user exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { googleId }
        ]
      }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name,
          profileImg: picture,
          googleId,
          isEmailVerified: true
        }
      });
      console.log('Created new user:', user.id);
    } else if (!user.googleId) {
      // Link existing user with Google account
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          profileImg: picture,
          isEmailVerified: true
        }
      });
      console.log('Linked existing user with Google:', user.id);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Authentication successful for user:', user.id);

    res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImg: user.profileImg
      }
    });

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    
    // Handle specific OAuth errors
    if (error.message.includes('invalid_grant')) {
      return res.status(400).json({ 
        error: 'Authorization code has expired or was already used. Please try signing in again.' 
      });
    }
    
    if (error.message.includes('invalid_client')) {
      return res.status(400).json({ 
        error: 'Invalid client configuration. Please check your Google OAuth settings.' 
      });
    }
    
    res.status(500).json({ error: 'Failed to complete Google authentication: ' + error.message });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
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
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
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
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 