# Google OAuth & Calendar Integration Setup Guide

## 🔐 **Step-by-Step Setup Process**

### **1. Google Cloud Console Setup**

1. **Create/Select Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable billing if not already enabled

2. **Enable APIs:**
   - Go to "APIs & Services" → "Library"
   - Enable these APIs:
     - Google+ API
     - Google Calendar API
     - Google Identity Services API

3. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Configure OAuth consent screen:
     - User Type: External
     - App name: "GlobalTrotters"
     - User support email: Your email
     - Developer contact: Your email
     - Scopes: Add `https://www.googleapis.com/auth/calendar`

4. **Create OAuth 2.0 Client ID:**
   - Application type: Web application
   - Name: "GlobalTrotters Web Client"
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173/auth/google/callback`
   - Download the client credentials JSON file

### **2. Environment Variables Setup**

#### **Backend (.env):**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/globaltrotters"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Server
PORT=3000
FRONTEND_URL="http://localhost:5173"

# AI Integration
OPENROUTER_API_KEY="your-openrouter-api-key"
OPENAI_MODEL="openai/gpt-4o-mini"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id-from-google-console"
GOOGLE_CLIENT_SECRET="your-google-client-secret-from-google-console"
GOOGLE_REDIRECT_URI="http://localhost:5173/auth/google/callback"

# Google Calendar
GOOGLE_CALENDAR_ID="primary"
```

#### **Frontend (.env):**
```env
# API Configuration
VITE_API_URL="http://localhost:3000"

# Google OAuth
VITE_GOOGLE_CLIENT_ID="your-google-client-id-from-google-console"
```

### **3. Database Migration**

Run the following commands to update your database schema:

```bash
cd backend
npx prisma migrate dev --name add_google_oauth_fields
```

### **4. Install Dependencies**

#### **Backend:**
```bash
cd backend
npm install google-auth-library googleapis
```

#### **Frontend:**
Add Google Sign-In script to `index.html`:
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### **5. Features Implemented**

#### **Google Sign-In:**
- ✅ OAuth 2.0 authentication flow
- ✅ Automatic user creation/linking
- ✅ JWT token generation
- ✅ Profile picture and email verification

#### **Google Calendar Integration:**
- ✅ OAuth 2.0 for Calendar access
- ✅ Add trips to Google Calendar
- ✅ Fetch user's calendar events
- ✅ Automatic reminders and notifications

#### **Frontend Components:**
- ✅ Google Sign-In button in LoginScreen
- ✅ Calendar integration in TripCalendar
- ✅ Connect/Disconnect Google Calendar
- ✅ Add trips to Google Calendar

### **6. API Endpoints**

#### **Authentication:**
- `POST /api/auth/google` - Google OAuth login

#### **Calendar:**
- `GET /api/calendar/auth-url` - Get Google Calendar auth URL
- `GET /api/calendar/callback` - Handle OAuth callback
- `POST /api/calendar/add-trip` - Add trip to Google Calendar
- `GET /api/calendar/events` - Get user's calendar events

### **7. Usage Instructions**

#### **For Users:**
1. **Google Sign-In:**
   - Click "Sign in with Google" on login page
   - Grant permissions to your Google account
   - Automatically logged in and redirected

2. **Google Calendar Integration:**
   - Go to Calendar page
   - Click "Connect Google Calendar"
   - Grant calendar permissions
   - View trips and Google events together
   - Add trips to Google Calendar with one click

#### **For Developers:**
1. **Testing:**
   - Use test Google accounts
   - Check browser console for errors
   - Verify tokens are stored correctly

2. **Production:**
   - Update redirect URIs for production domain
   - Use environment-specific client IDs
   - Implement proper error handling

### **8. Security Considerations**

- ✅ JWT tokens for session management
- ✅ Secure token storage in database
- ✅ HTTPS required for production
- ✅ Proper CORS configuration
- ✅ Rate limiting on API endpoints

### **9. Troubleshooting**

#### **Common Issues:**
1. **"Google Sign-In not available"**
   - Check if Google script is loaded
   - Verify VITE_GOOGLE_CLIENT_ID is set

2. **"Invalid redirect URI"**
   - Check Google Console settings
   - Verify redirect URI matches exactly

3. **"Calendar not connected"**
   - Check if user has granted calendar permissions
   - Verify tokens are stored in database

4. **"OAuth consent screen not configured"**
   - Complete OAuth consent screen setup
   - Add required scopes

### **10. Production Deployment**

1. **Update Google Console:**
   - Add production domain to authorized origins
   - Add production redirect URIs
   - Publish OAuth consent screen

2. **Environment Variables:**
   - Use production Google Client ID
   - Set secure JWT secret
   - Configure production database URL

3. **HTTPS:**
   - Ensure all endpoints use HTTPS
   - Update redirect URIs to use HTTPS

## 🎉 **You're All Set!**

Your GlobalTrotters application now has full Google OAuth and Calendar integration. Users can sign in with Google and sync their trips with Google Calendar seamlessly! 