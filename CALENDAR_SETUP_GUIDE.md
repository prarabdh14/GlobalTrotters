# Google Calendar Integration Setup Guide

## 🚀 **Quick Setup Steps**

### **Step 1: Google Cloud Console Configuration**

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Enable APIs (if not already done):**
   - Go to "APIs & Services" → "Library"
   - Search and enable:
     - Google Calendar API
     - Google Identity Services API

3. **Configure OAuth Consent Screen:**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Click "Edit App" or "Configure Consent Screen"
   - Fill in required fields:
     - App name: "GlobalTrotters"
     - User support email: Your email
     - Developer contact: Your email

4. **Add Required Scopes:**
   - In the OAuth consent screen, click "Add or Remove Scopes"
   - Add these scopes:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`

5. **Add Test Users:**
   - Add your email address as a test user
   - This allows you to test the OAuth flow

6. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: Web application
   - Name: "GlobalTrotters Web Client"
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173/auth/google/callback`
   - **Copy the Client ID and Client Secret**

### **Step 2: Environment Variables**

#### **Backend (.env):**
```env
# Add these to your existing .env file
GOOGLE_CLIENT_ID="your-client-id-from-step-1"
GOOGLE_CLIENT_SECRET="your-client-secret-from-step-1"
GOOGLE_REDIRECT_URI="http://localhost:5173/auth/google/callback"
```

#### **Frontend (.env):**
```env
# Add this to your frontend .env file
VITE_GOOGLE_CLIENT_ID="your-client-id-from-step-1"
```

### **Step 3: Database Migration**

```bash
cd backend
npx prisma migrate dev --name add_google_oauth_fields
```

### **Step 4: Install Dependencies**

```bash
cd backend
npm install google-auth-library googleapis
```

### **Step 5: Test the Integration**

1. **Start your servers:**
   ```bash
   # Backend
   cd backend
   npm run dev
   
   # Frontend (in another terminal)
   cd frontend
   npm run dev
   ```

2. **Test Google Sign-In:**
   - Go to login page
   - Click "Sign in with Google"
   - Grant permissions

3. **Test Calendar Integration:**
   - Go to Calendar page
   - Click "Connect Calendar"
   - Grant calendar permissions
   - Try adding a trip to Google Calendar

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"OAuth consent screen not configured"**
   - Complete Step 1.3 above
   - Add your email as test user

2. **"Invalid redirect URI"**
   - Check that redirect URI in Google Console matches exactly
   - Should be: `http://localhost:5173/auth/google/callback`

3. **"Scope not found"**
   - Make sure you added all required scopes in Step 1.4
   - Wait a few minutes for changes to propagate

4. **"Google Sign-In not available"**
   - Check that VITE_GOOGLE_CLIENT_ID is set in frontend .env
   - Verify Google script is loaded in index.html

### **Testing Checklist:**

- [ ] Google Sign-In works on login page
- [ ] User is created/linked with Google account
- [ ] Calendar connection button appears
- [ ] OAuth flow completes successfully
- [ ] Calendar events can be fetched
- [ ] Trips can be added to Google Calendar

## 🎉 **You're Ready!**

Once you complete these steps, your GlobalTrotters app will have full Google Calendar integration. Users can:
- Sign in with Google
- Connect their Google Calendar
- View trips and Google events together
- Add trips to Google Calendar with one click 