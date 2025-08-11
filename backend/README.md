# GlobalTrotters Backend API

A comprehensive REST API for the GlobalTrotters travel planning application built with Node.js, Express, and Prisma.

## Features

- 🔐 **Authentication & Authorization** - JWT-based authentication with bcrypt password hashing
- 🗺️ **Trip Management** - Create, read, update, and delete trips with stops and activities
- 🏙️ **City & Activity Discovery** - Browse destinations and activities with advanced filtering
- 💰 **Budget Tracking** - Manage trip budgets and expenses
- 👥 **User Management** - User profiles, statistics, and travel history
- 📊 **Admin Dashboard** - Platform analytics and user management
- 🔒 **Security** - Input validation, rate limiting, and CORS protection

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcryptjs
- **Validation**: express-validator
- **Security**: helmet, express-rate-limit
- **CORS**: cors middleware

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/globetrotters"
   JWT_SECRET="your-super-secret-jwt-key-here"
   OPENROUTER_API_KEY="your-openrouter-api-key-here"
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL="http://localhost:5173"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Login user |
| GET | `/me` | Get current user profile |
| PUT | `/me` | Update user profile |
| PUT | `/change-password` | Change user password |

### Users (`/api/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get user profile |
| PUT | `/profile` | Update user profile |
| GET | `/stats` | Get user statistics |
| GET | `/travel-history` | Get user's travel history |
| GET | `/favorite-destinations` | Get user's favorite destinations |
| GET | `/travel-timeline` | Get user's travel timeline |
| DELETE | `/account` | Delete user account |

### Trips (`/api/trips`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all user trips |
| GET | `/:id` | Get single trip details |
| POST | `/` | Create new trip |
| PUT | `/:id` | Update trip |
| DELETE | `/:id` | Delete trip |
| POST | `/:id/stops` | Add stop to trip |
| PUT | `/:tripId/stops/:stopId` | Update trip stop |
| DELETE | `/:tripId/stops/:stopId` | Delete trip stop |
| POST | `/:tripId/stops/:stopId/activities` | Add activity to trip stop |
| PUT | `/:tripId/activities/:activityId` | Update trip activity |
| DELETE | `/:tripId/activities/:activityId` | Delete trip activity |

### Cities (`/api/cities`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all cities with filtering |
| GET | `/:id` | Get single city with activities |
| GET | `/popular/list` | Get popular cities |
| GET | `/region/:region` | Get cities by region |
| GET | `/cost/:level` | Get cities by cost level |
| GET | `/stats/overview` | Get city statistics |

### Activities (`/api/activities`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all activities with filtering |
| GET | `/:id` | Get single activity |
| GET | `/city/:cityId` | Get activities by city |
| GET | `/type/:type` | Get activities by type |
| GET | `/popular/list` | Get popular activities |
| GET | `/types/list` | Get activity types |
| GET | `/stats/overview` | Get activity statistics |

### Budgets (`/api/budgets`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/trip/:tripId` | Get budget items for trip |
| POST | `/trip/:tripId` | Add budget item to trip |
| PUT | `/:id` | Update budget item |
| DELETE | `/:id` | Delete budget item |
| GET | `/trip/:tripId/summary` | Get budget summary for trip |
| GET | `/user/stats` | Get user budget statistics |
| GET | `/categories/list` | Get budget categories |

### Admin (`/api/admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/overview` | Get platform overview |
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get user details |
| DELETE | `/users/:id` | Delete user |
| GET | `/analytics` | Get platform analytics |
| GET | `/analytics/monthly` | Get monthly performance data |

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "details": [] // Validation errors (if applicable)
}
```

## Validation

Input validation is handled using express-validator with custom error messages for:

- User registration and login
- Trip creation and updates
- Budget item management
- Activity and city data

## Security Features

- **Password Hashing**: bcryptjs with 12 salt rounds
- **JWT Tokens**: 7-day expiration
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable origins
- **Input Validation**: Comprehensive request validation
- **Helmet**: Security headers

## Database Schema

The application uses Prisma with the following main models:

- **User**: User accounts and profiles
- **Trip**: Travel itineraries
- **TripStop**: Individual stops within trips
- **City**: Destination cities
- **Activity**: Things to do in cities
- **TripActivity**: Activities scheduled for trips
- **BudgetItem**: Expense tracking
- **SharedTrip**: Trip sharing functionality

## Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

### Database Migrations

```bash
npx prisma migrate dev    # Create and apply migration
npx prisma migrate reset  # Reset database
npx prisma studio        # Open Prisma Studio
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `OPENROUTER_API_KEY` | OpenRouter API key for OpenAI access | Yes (for AI features) |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `FRONTEND_URL` | Frontend URL for CORS | No |
| `OPENAI_MODEL` | OpenAI model to use (default: openai/gpt-4o-mini) | No |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License. 

# AI Itinerary (OpenAI via OpenRouter) Integration

Env vars:

- `OPENROUTER_API_KEY` (required)
- `OPENAI_MODEL` (optional, default: openai/gpt-4o-mini)

Run migrations:

- Update Prisma schema already checked in (AiItinerary model)
- Then run: `npx prisma migrate dev --name ai_itineraries`

Routes:

- `POST /api/ai/plan` body: `{ source, destination, start_date, end_date, preferences?, budget?, force_refresh? }`
  - Cache-first by `cache_key` (sha256 of normalized inputs + model + userId)
  - Returns cached row or creates new via OpenAI and stores prompt + outputs

- `POST /api/ai/reschedule` body: `{ original_cache_key, new_start_date, new_end_date, force_refresh? }`
  - Reschedules existing itinerary with new dates while preserving source/destination/preferences/budget
  - Creates new cache entry for the rescheduled version
  - Returns rescheduled itinerary with metadata about the change

- `GET /api/ai/reschedule-options/:cache_key`
  - Shows reschedule options for an existing itinerary
  - Returns original dates, existing rescheduled versions, and suggested new date ranges
  - Includes smart suggestions (next month, next year, weekend start)

- `GET /api/ai/search?q=...&limit=20&offset=0`
  - Searches cached itineraries (source/destination/response_text)

- `GET /api/ai/user`
  - Gets all AI itineraries for the authenticated user

Add to server is done via `app.use('/api/ai', aiRoutes)`.

## Reschedule Flow

1. User has existing itinerary (gets `cache_key`)
2. User wants to reschedule → calls `/reschedule-options/:cache_key`
3. System shows suggested dates and existing rescheduled versions
4. User picks new dates → calls `/reschedule` with new dates
5. System generates new itinerary (or returns cached if exists)
6. New itinerary is stored with link to original via metadata

## Frontend Components

- `RescheduleModal`: Modal for selecting new dates and viewing suggestions
- `AIItineraryCard`: Card component with reschedule button
- `AIItineraries`: Page displaying all user's AI itineraries
- `ItineraryView`: Enhanced with reschedule button for AI itineraries

## Key Features

✅ **Smart Caching**: New dates get their own cache entry
✅ **User Isolation**: Each user only sees their own itineraries
✅ **Smart Suggestions**: Automatic date recommendations
✅ **Version Tracking**: Links rescheduled itineraries to originals
✅ **Efficient**: Only calls OpenAI when truly needed 