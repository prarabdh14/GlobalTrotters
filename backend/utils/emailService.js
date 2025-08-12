const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Generate HTML email template for itinerary
const generateItineraryEmail = (user, trip, stops) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  let stopsHtml = '';
  if (stops && stops.length > 0) {
    stopsHtml = stops.map((stop, index) => {
      let activitiesHtml = '';
      if (stop.activities && stop.activities.length > 0) {
        activitiesHtml = stop.activities.map(activity => `
          <div style="margin-left: 20px; margin-bottom: 10px; padding: 10px; background-color: #f8f9fa; border-left: 3px solid #007bff; border-radius: 4px;">
            <strong>${activity.activity?.name || 'Activity'}</strong><br>
            <small style="color: #6c757d;">
              ${activity.startTime ? formatTime(activity.startTime) : 'TBD'} | 
              ${activity.activity?.cost ? formatCurrency(activity.activity.cost) : 'Free'}
            </small>
            ${activity.note ? `<br><em style="color: #6c757d;">${activity.note}</em>` : ''}
          </div>
        `).join('');
      }

      return `
        <div style="margin-bottom: 30px; padding: 20px; background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #007bff; margin-bottom: 15px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Stop ${index + 1}: ${stop.city?.name || 'Unknown City'}
          </h3>
          <p style="color: #6c757d; margin-bottom: 15px;">
            <strong>Date:</strong> ${stop.startDate ? formatDate(stop.startDate) : 'TBD'}<br>
            <strong>Duration:</strong> ${stop.duration || 'Not specified'}
          </p>
          ${activitiesHtml ? `
            <h4 style="color: #495057; margin-bottom: 10px;">Activities:</h4>
            ${activitiesHtml}
          ` : '<p style="color: #6c757d; font-style: italic;">No activities planned yet</p>'}
        </div>
      `;
    }).join('');
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Trip Itinerary - ${trip.name}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #007bff;">
          <h1 style="color: #007bff; margin-bottom: 10px;">✈️ GlobalTrotters</h1>
          <h2 style="color: #495057; margin: 0;">Your Trip Itinerary</h2>
        </div>

        <!-- Trip Overview -->
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #1976d2; margin-top: 0;">${trip.name}</h3>
          ${trip.description ? `<p style="color: #424242; margin-bottom: 15px;">${trip.description}</p>` : ''}
          <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px;">
              <strong style="color: #1976d2;">Start Date:</strong><br>
              <span style="color: #424242;">${formatDate(trip.startDate)}</span>
            </div>
            <div style="flex: 1; min-width: 200px;">
              <strong style="color: #1976d2;">End Date:</strong><br>
              <span style="color: #424242;">${formatDate(trip.endDate)}</span>
            </div>
          </div>
        </div>

        <!-- Itinerary Details -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1976d2; margin-bottom: 20px; border-bottom: 2px solid #1976d2; padding-bottom: 10px;">
            📍 Detailed Itinerary
          </h3>
          ${stopsHtml || '<p style="color: #6c757d; font-style: italic; text-align: center; padding: 40px;">No stops planned yet. Start building your itinerary!</p>'}
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px;">
          <p>Thank you for using GlobalTrotters!</p>
          <p>Happy Traveling! 🌍</p>
          <p style="margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #007bff; text-decoration: none;">
              Visit GlobalTrotters
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send itinerary email
const sendItineraryEmail = async (user, trip, stops) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"GlobalTrotters" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Your Trip Itinerary: ${trip.name}`,
      html: generateItineraryEmail(user, trip, stops)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Itinerary email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending itinerary email:', error);
    return { success: false, error: error.message };
  }
};

// Send trip update notification
const sendTripUpdateEmail = async (user, trip, action) => {
  try {
    const transporter = createTransporter();
    
    const actionText = action === 'created' ? 'created' : 'updated';
    const subject = `Trip ${actionText}: ${trip.name}`;
    
    const mailOptions = {
      from: `"GlobalTrotters" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #007bff;">Trip ${actionText} successfully!</h2>
            <p>Hi ${user.name},</p>
            <p>Your trip "<strong>${trip.name}</strong>" has been ${actionText} successfully.</p>
            <p>You can view and manage your trip details in your GlobalTrotters dashboard.</p>
            <p>Happy planning!</p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Trip update email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending trip update email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email to new users
const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"GlobalTrotters" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Welcome to GlobalTrotters, ${user.name}! 🌍`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to GlobalTrotters</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #007bff;">
              <h1 style="color: #007bff; margin-bottom: 10px; font-size: 28px;">✈️ GlobalTrotters</h1>
              <h2 style="color: #495057; margin: 0; font-size: 24px;">Welcome Aboard!</h2>
            </div>

            <!-- Welcome Message -->
            <div style="margin-bottom: 30px;">
              <h3 style="color: #1976d2; margin-bottom: 15px;">Hello ${user.name}! 👋</h3>
              <p style="color: #424242; font-size: 16px; margin-bottom: 20px;">
                Welcome to GlobalTrotters! We're thrilled to have you join our community of passionate travelers. 
                You're now part of a platform that makes trip planning effortless, exciting, and personalized.
              </p>
            </div>

            <!-- Features Section -->
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h3 style="color: #1976d2; margin-top: 0; margin-bottom: 15px;">🚀 What You Can Do Now:</h3>
              <ul style="color: #424242; padding-left: 20px; margin: 0;">
                <li style="margin-bottom: 8px;"><strong>Create Trips:</strong> Plan your next adventure with our intuitive trip builder</li>
                <li style="margin-bottom: 8px;"><strong>AI-Powered Planning:</strong> Get personalized itineraries generated by our AI travel assistant</li>
                <li style="margin-bottom: 8px;"><strong>Budget Management:</strong> Track expenses and stay within your travel budget</li>
                <li style="margin-bottom: 8px;"><strong>City Exploration:</strong> Discover amazing destinations and activities</li>
                <li style="margin-bottom: 8px;"><strong>Share & Collaborate:</strong> Share your trips with friends and family</li>
                <li style="margin-bottom: 0;"><strong>Email Itineraries:</strong> Get detailed trip plans delivered to your inbox</li>
              </ul>
            </div>

            <!-- Quick Start Guide -->
            <div style="margin-bottom: 30px;">
              <h3 style="color: #1976d2; margin-bottom: 15px;">🎯 Quick Start Guide:</h3>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #007bff;">
                <p style="margin: 0; color: #424242;">
                  <strong>Step 1:</strong> Explore the dashboard to see your travel overview<br>
                  <strong>Step 2:</strong> Click "Create Trip" to start planning your first adventure<br>
                  <strong>Step 3:</strong> Try our AI planner for instant itinerary suggestions<br>
                  <strong>Step 4:</strong> Add stops, activities, and manage your budget
                </p>
              </div>
            </div>

            <!-- Call to Action -->
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
                 style="display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Start Planning Your First Trip
              </a>
            </div>

            <!-- Tips Section -->
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #ffc107;">
              <h4 style="color: #856404; margin-top: 0; margin-bottom: 10px;">💡 Pro Tips:</h4>
              <ul style="color: #856404; padding-left: 20px; margin: 0;">
                <li style="margin-bottom: 5px;">Use our AI planner for quick itinerary suggestions</li>
                <li style="margin-bottom: 5px;">Set realistic budgets to track your expenses</li>
                <li style="margin-bottom: 5px;">Explore different cities to discover new destinations</li>
                <li style="margin-bottom: 0;">Share your trips to get feedback from friends</li>
              </ul>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px;">
              <p style="margin-bottom: 10px;">Thank you for choosing GlobalTrotters!</p>
              <p style="margin-bottom: 15px;">Happy Traveling! 🌍✈️</p>
              <p style="margin-bottom: 10px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #007bff; text-decoration: none;">
                  Visit GlobalTrotters
                </a>
              </p>
              <p style="margin: 0; font-size: 12px;">
                If you have any questions, feel free to reach out to our support team.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendItineraryEmail,
  sendTripUpdateEmail,
  sendWelcomeEmail
}; 