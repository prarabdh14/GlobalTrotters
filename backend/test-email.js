require('dotenv').config();
const { sendWelcomeEmail } = require('./utils/emailService');

// Test user data
const testUser = {
  name: "Test User",
  email: "test@example.com" // Replace with your actual email
};

// Test the email service
async function testEmail() {
  console.log('🔧 Testing Email Service Configuration...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables Check:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set');
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL ? '✅ Set' : '❌ Not set');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('\n❌ Email configuration is incomplete!');
    console.log('Please set up your .env file with EMAIL_USER and EMAIL_PASSWORD');
    console.log('See EMAIL_CONFIGURATION.md for detailed setup instructions');
    return;
  }
  
  console.log('\n📧 Attempting to send test email...');
  
  try {
    const result = await sendWelcomeEmail(testUser);
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('📨 Message ID:', result.messageId);
      console.log('📧 Check your email inbox (and spam folder)');
    } else {
      console.log('❌ Email failed to send');
      console.log('🔍 Error:', result.error);
      console.log('\n💡 Common solutions:');
      console.log('1. Check if EMAIL_USER and EMAIL_PASSWORD are correct');
      console.log('2. Ensure you\'re using a Gmail app password (not regular password)');
      console.log('3. Verify 2-Factor Authentication is enabled on your Gmail account');
      console.log('4. Check if your Gmail account has any security restrictions');
    }
  } catch (error) {
    console.error('❌ Email test error:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure your .env file is in the backend directory');
    console.log('2. Restart your backend server after updating .env');
    console.log('3. Check the EMAIL_CONFIGURATION.md file for setup instructions');
  }
}

// Run the test
testEmail(); 