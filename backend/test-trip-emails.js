require('dotenv').config();
const { sendTripUpdateEmail, sendItineraryEmail } = require('./utils/emailService');

// Test user data
const testUser = {
  name: "Test User",
  email: "test@example.com" // Replace with your actual email
};

// Test trip data
const testTrip = {
  name: "Test Trip to Paris",
  description: "A wonderful trip to the City of Light",
  startDate: new Date('2024-06-01'),
  endDate: new Date('2024-06-07')
};

// Test stops data
const testStops = [
  {
    city: { name: "Paris" },
    startDate: new Date('2024-06-01'),
    duration: "3 days",
    activities: [
      {
        activity: { name: "Visit Eiffel Tower", cost: "€30" },
        startTime: new Date('2024-06-01T10:00:00'),
        note: "Book tickets in advance"
      },
      {
        activity: { name: "Louvre Museum", cost: "€17" },
        startTime: new Date('2024-06-02T14:00:00'),
        note: "Free on first Sunday"
      }
    ]
  }
];

// Test trip update email
async function testTripUpdateEmail() {
  console.log('📧 Testing Trip Update Email...\n');
  
  try {
    const result = await sendTripUpdateEmail(testUser, testTrip, 'created');
    
    if (result.success) {
      console.log('✅ Trip update email sent successfully!');
      console.log('📨 Message ID:', result.messageId);
    } else {
      console.log('❌ Trip update email failed');
      console.log('🔍 Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Trip update email test error:', error.message);
  }
}

// Test detailed itinerary email
async function testItineraryEmail() {
  console.log('\n📧 Testing Detailed Itinerary Email...\n');
  
  try {
    const result = await sendItineraryEmail(testUser, testTrip, testStops);
    
    if (result.success) {
      console.log('✅ Detailed itinerary email sent successfully!');
      console.log('📨 Message ID:', result.messageId);
    } else {
      console.log('❌ Detailed itinerary email failed');
      console.log('🔍 Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Detailed itinerary email test error:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🔧 Testing Trip Email Functions...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables Check:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set');
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL ? '✅ Set' : '❌ Not set');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('\n❌ Email configuration is incomplete!');
    return;
  }
  
  await testTripUpdateEmail();
  await testItineraryEmail();
  
  console.log('\n🎉 Trip email tests completed!');
  console.log('📧 Check your email inbox for the test emails');
}

// Run the tests
runAllTests(); 