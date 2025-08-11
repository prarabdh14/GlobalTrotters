const express = require('express');
const crypto = require('crypto');
const prisma = require('../config/database');
const router = express.Router();

// Lazy OpenAI import to keep startup fast
let openai = null;
async function getOpenAI() {
  if (!openai) {
    const OpenAI = require('openai');
    openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
        'X-Title': 'GlobalTrotters'
      }
    });
  }
  return openai;
}

const MODEL = process.env.OPENAI_MODEL || 'openai/gpt-4o-mini';

const JSON_SCHEMA = {
  type: 'object',
  properties: {
    trip_summary: {
      type: 'object',
      properties: {
        route: { type: 'string' },
        duration_days: { type: 'integer' },
        total_estimated_cost: { type: 'number' },
        currency: { type: 'string' }
      },
      required: ['route','duration_days','total_estimated_cost','currency']
    },
    daily_plan: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          day: { type: 'integer' },
          date: { type: 'string' },
          city: { type: 'string' },
          morning: { type: 'array', items: { type: 'string' } },
          afternoon: { type: 'array', items: { type: 'string' } },
          evening: { type: 'array', items: { type: 'string' } },
          meals: {
            type: 'object',
            properties: {
              breakfast: { type: 'string' },
              lunch: { type: 'string' },
              dinner: { type: 'string' }
            }
          },
          estimated_daily_cost: { type: 'number' }
        },
        required: ['day','date','city','morning','afternoon','evening','meals','estimated_daily_cost']
      }
    },
    packing_tips: { type: 'array', items: { type: 'string' } },
    local_tips: { type: 'array', items: { type: 'string' } },
    assumptions: { type: 'array', items: { type: 'string' } }
  },
  required: ['trip_summary','daily_plan','packing_tips','local_tips','assumptions']
};

function buildPrompt(p) {
  return `You are GlobeTrotters' expert travel planner. Produce safe, realistic, actionable, detailed and personalized  itineraries.\n` +
    `Follow the requested JSON schema exactly. Assume reasonable defaults and list assumptions.\n\n` +
    `Inputs:\n` +
    `- Source: ${p.source}\n` +
    `- Destination: ${p.destination}\n` +
    `- Start date: ${p.start_date}\n` +
    `- End date: ${p.end_date}\n` +
    `- Preferences: ${JSON.stringify(p.preferences || {})}\n` +
    `- Budget: ${p.budget || 'unspecified'}\n\n` +

    `-Your task:

    First, estimate a minimum recommended budget for this trip based on historical travel data for the destination, including typical costs for transport, accommodation, food, and activities. Inform the user if the budget is below this recommendation.

    Create a detailed daily itinerary covering each day of the trip from start to end date:

    Include recommended modes of transport for each journey leg (flights, trains, buses, taxis), highlighting options that fit the user's budget.

    Suggest top popular tourist attractions and must-visit sites in the destination city, focusing on those that match the user's travel preferences (e.g., if they prefer museums and natural places, prioritize renowned museums, national parks, gardens).

    Recommend popular hotels, hostels, or guesthouses that offer good value while fitting within the budget, including approximate prices.

    Suggest budget-friendly or local dining options for meals.

    Where possible, mention the most visited places, local favorites, or hidden gems that align with the user's interests, providing a mix of widely known attractions and unique experiences.

    Provide cost estimates for each major part of the trip (transport, accommodation, activities) so the user can track expenses.

    Structure the itinerary clearly by day and time, including activity durations and travel times.

    Example Output Structure:
    Day 1:

    Morning: Travel from {source} to {destination} by [recommended mode]. Estimated cost: $X.

    Afternoon: Visit [popular museum/park/etc.], admission fee approx. $Y.

    Evening: Dinner at [local restaurant], budget $Z.

    Accommodation: Stay at [hotel name], cost per night approx. $W.

    Day 2: ...

    Additional Instructions:

    Emphasize user preferences throughout the itinerary.

    Keep the itinerary within the provided budget or advise if it is not feasible.

    Highlight any cost-saving tips, such as discount passes or travel timings.

    Use clear, concise language suitable for an easy-to-follow travel plan.

    Constraints:
    - Reflect travel time on first/last day if applicable.
    - Prefer public transport by default unless preferences say otherwise.
    - 3–6 activities per day, balanced (sightseeing, meals, rest).
    - One currency across outputs; specify currency.
    - Keep costs realistic for season/region.

    Output:
    STRICT JSON ONLY, matching this schema (no prose outside JSON):
    ${JSON.stringify(JSON_SCHEMA, null, 2)}
    If JSON cannot be produced, fallback to well-structured markdown.`;
    }

function makeCacheKey({ source, destination, start_date, end_date, preferences, budget, model, userId }) {
  const norm = {
    source: String(source || '').trim().toLowerCase(),
    destination: String(destination || '').trim().toLowerCase(),
    start_date: new Date(start_date).toISOString().slice(0,10),
    end_date: new Date(end_date).toISOString().slice(0,10),
    preferences: preferences ? JSON.stringify(preferences, Object.keys(preferences).sort()) : '{}',
    budget: String(budget || '').trim().toLowerCase(),
    model,
    userId: String(userId || '')
  };
  const payload = `${norm.source}|${norm.destination}|${norm.start_date}|${norm.end_date}|${norm.preferences}|${norm.budget}|${norm.model}|${norm.userId}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

// POST /api/ai/plan
router.post('/plan', async (req, res) => {
  try {
    console.log('=== AI PLAN REQUEST START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { source, destination, start_date, end_date, preferences, budget, force_refresh } = req.body || {};
    console.log('Extracted params:', { source, destination, start_date, end_date, preferences, budget, force_refresh });
    
    if (!source || !destination || !start_date || !end_date) {
      console.log('Missing required fields:', { source, destination, start_date, end_date });
      return res.status(400).json({ error: 'source, destination, start_date, end_date are required' });
    }

    // Get user ID from the request (assuming it's set by auth middleware)
    const userId = req.user?.id;
    if (!userId) {
      console.log('No user ID found in request');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const cacheKey = makeCacheKey({ source, destination, start_date, end_date, preferences, budget, model: MODEL, userId });
    console.log('Generated cache key:', cacheKey);

    if (!force_refresh) {
      console.log('Checking for cached response...');
      const cached = await prisma.aiItinerary.findUnique({ where: { cacheKey } });
      if (cached) {
        console.log('Found cached response, returning...');
        return res.json(cached);
      }
      console.log('No cached response found');
    }

    console.log('Checking OPENROUTER_API_KEY...');
    console.log('OPENROUTER_API_KEY exists:', !!process.env.OPENROUTER_API_KEY);
    console.log('OPENROUTER_API_KEY length:', process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.length : 0);
    
    if (!process.env.OPENROUTER_API_KEY) {
      console.log('ERROR: OPENROUTER_API_KEY not configured on server');
      return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured on server' });
    }

    console.log('Building prompt...');
    const prompt = buildPrompt({ source, destination, start_date, end_date, preferences, budget });
    console.log('Prompt length:', prompt.length);
    console.log('Prompt preview:', prompt.substring(0, 200) + '...');
    
    console.log('Getting OpenAI client...');
    const client = await getOpenAI();
    console.log('OpenAI client obtained successfully');
    
    console.log('Making API request to OpenAI...');
    console.log('Model:', MODEL);
    console.log('Temperature:', 0.7);
    console.log('Max tokens:', 4000);
    
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a travel planning expert. Always respond with valid JSON matching the provided schema.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    console.log('OpenAI API response received');
    console.log('Response choices:', completion.choices.length);
    const text = completion.choices[0].message.content;
    console.log('Response text length:', text.length);
    console.log('Response text preview:', text.substring(0, 200) + '...');

    console.log('Parsing JSON response...');
    let parsed = null;
    try { 
      parsed = JSON.parse(text); 
      console.log('JSON parsed successfully');
    } catch (parseError) {
      console.log('JSON parse error:', parseError.message);
      console.log('Raw text that failed to parse:', text);
    }
    
    console.log('Saving to database...');
    const created = await prisma.aiItinerary.upsert({
      where: { cacheKey },
      update: { responseJson: parsed, responseText: text, prompt, model: MODEL },
      create: {
        cacheKey,
        userId,
        source,
        destination,
        startDate: new Date(start_date),
        endDate: new Date(end_date),
        preferences: preferences || {},
        budget: budget || null,
        model: MODEL,
        prompt,
        responseJson: parsed,
        responseText: text
      }
    });

    console.log('Database save successful');
    console.log('=== AI PLAN REQUEST END ===');
    return res.json(created);
  } catch (err) {
    console.error('=== AI PLAN ERROR ===');
    console.error('Error type:', err.constructor.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Full error object:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    console.error('=== END AI PLAN ERROR ===');
    return res.status(500).json({ error: 'Failed to generate itinerary', details: err.message });
  }
});

// GET /api/ai/search?q=...&limit=20&offset=0
router.get('/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const take = Number(req.query.limit || 20);
    const skip = Number(req.query.offset || 0);

    if (!q) return res.json({ results: [], total: 0 });

    // Fallback search via prisma contains; you can replace with raw SQL FTS if needed
    const results = await prisma.aiItinerary.findMany({
      where: {
        OR: [
          { source: { contains: q, mode: 'insensitive' } },
          { destination: { contains: q, mode: 'insensitive' } },
          { responseText: { contains: q, mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip
    });

    return res.json({ results, total: results.length });
  } catch (err) {
    console.error('AI search error:', err);
    return res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/ai/user - Get AI itineraries for the authenticated user
router.get('/user', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const itineraries = await prisma.aiItinerary.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return res.json(itineraries);
  } catch (err) {
    console.error('Error fetching user AI itineraries:', err);
    return res.status(500).json({ error: 'Failed to fetch itineraries' });
  }
});

// POST /api/ai/reschedule
router.post('/reschedule', async (req, res) => {
  try {
    console.log('=== AI RESCHEDULE REQUEST START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { 
      original_cache_key, 
      new_start_date, 
      new_end_date, 
      force_refresh 
    } = req.body || {};
    
    if (!original_cache_key || !new_start_date || !new_end_date) {
      console.log('Missing required fields:', { original_cache_key, new_start_date, new_end_date });
      return res.status(400).json({ 
        error: 'original_cache_key, new_start_date, new_end_date are required' 
      });
    }

    // Get user ID from the request
    const userId = req.user?.id;
    if (!userId) {
      console.log('No user ID found in request');
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get the original itinerary
    const original = await prisma.aiItinerary.findUnique({ 
      where: { cacheKey: original_cache_key } 
    });
    
    if (!original) {
      console.log('Original itinerary not found:', original_cache_key);
      return res.status(404).json({ 
        error: 'Original itinerary not found' 
      });
    }

    // Verify user owns the original itinerary
    if (original.userId !== userId) {
      console.log('User does not own this itinerary:', { userId, ownerId: original.userId });
      return res.status(403).json({ 
        error: 'You can only reschedule your own itineraries' 
      });
    }

    // Create new cache key with updated dates
    const newCacheKey = makeCacheKey({
      source: original.source,
      destination: original.destination,
      start_date: new_start_date,
      end_date: new_end_date,
      preferences: original.preferences,
      budget: original.budget,
      model: original.model,
      userId
    });

    console.log('Generated new cache key:', newCacheKey);

    // Check if we already have a cached version with these new dates
    if (!force_refresh) {
      console.log('Checking for cached rescheduled response...');
      const cached = await prisma.aiItinerary.findUnique({ 
        where: { cacheKey: newCacheKey } 
      });
      if (cached) {
        console.log('Found cached rescheduled response, returning...');
        return res.json(cached);
      }
      console.log('No cached rescheduled response found');
    }

    console.log('Checking OPENROUTER_API_KEY...');
    if (!process.env.OPENROUTER_API_KEY) {
      console.log('ERROR: OPENROUTER_API_KEY not configured on server');
      return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured on server' });
    }

    // Generate new prompt with updated dates
    console.log('Building reschedule prompt...');
    const prompt = buildPrompt({
      source: original.source,
      destination: original.destination,
      start_date: new_start_date,
      end_date: new_end_date,
      preferences: original.preferences,
      budget: original.budget
    });

    console.log('Getting OpenAI client...');
    const client = await getOpenAI();
    console.log('OpenAI client obtained successfully');
    
    console.log('Making API request to OpenAI for reschedule...');
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a travel planning expert. Always respond with valid JSON matching the provided schema.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    console.log('OpenAI API response received for reschedule');
    const text = completion.choices[0].message.content;
    console.log('Response text length:', text.length);

    console.log('Parsing JSON response...');
    let parsed = null;
    try { 
      parsed = JSON.parse(text); 
      console.log('JSON parsed successfully');
    } catch (parseError) {
      console.log('JSON parse error:', parseError.message);
      console.log('Raw text that failed to parse:', text);
    }
    
    console.log('Saving rescheduled itinerary to database...');
    const created = await prisma.aiItinerary.upsert({
      where: { cacheKey: newCacheKey },
      update: { 
        responseJson: parsed, 
        responseText: text, 
        prompt, 
        model: MODEL 
      },
      create: {
        cacheKey: newCacheKey,
        userId,
        source: original.source,
        destination: original.destination,
        startDate: new Date(new_start_date),
        endDate: new Date(new_end_date),
        preferences: original.preferences,
        budget: original.budget,
        model: MODEL,
        prompt,
        responseJson: parsed,
        responseText: text
      }
    });

    // Add reschedule metadata
    const rescheduled = {
      ...created,
      rescheduled_from: original_cache_key,
      original_dates: {
        start: original.startDate,
        end: original.endDate
      },
      new_dates: {
        start: new Date(new_start_date),
        end: new Date(new_end_date)
      }
    };

    console.log('Rescheduled itinerary saved successfully');
    console.log('=== AI RESCHEDULE REQUEST END ===');
    return res.json(rescheduled);
  } catch (err) {
    console.error('=== AI RESCHEDULE ERROR ===');
    console.error('Error type:', err.constructor.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('=== END AI RESCHEDULE ERROR ===');
    return res.status(500).json({ error: 'Failed to reschedule itinerary', details: err.message });
  }
});

// GET /api/ai/reschedule-options/:cache_key
router.get('/reschedule-options/:cache_key', async (req, res) => {
  try {
    console.log('=== RESCHEDULE OPTIONS REQUEST START ===');
    const { cache_key } = req.params;
    console.log('Cache key:', cache_key);
    
    // Get user ID from the request
    const userId = req.user?.id;
    if (!userId) {
      console.log('No user ID found in request');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const original = await prisma.aiItinerary.findUnique({ 
      where: { cacheKey: cache_key } 
    });
    
    if (!original) {
      console.log('Itinerary not found:', cache_key);
      return res.status(404).json({ 
        error: 'Itinerary not found' 
      });
    }

    // Verify user owns the itinerary
    if (original.userId !== userId) {
      console.log('User does not own this itinerary:', { userId, ownerId: original.userId });
      return res.status(403).json({ 
        error: 'You can only view reschedule options for your own itineraries' 
      });
    }

    // Find all rescheduled versions of this itinerary
    const rescheduled = await prisma.aiItinerary.findMany({
      where: {
        source: original.source,
        destination: original.destination,
        preferences: original.preferences,
        budget: original.budget,
        userId: original.userId,
        cacheKey: { not: cache_key } // Exclude original
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Calculate date variations
    const originalDuration = Math.ceil(
      (new Date(original.endDate) - new Date(original.startDate)) / (1000 * 60 * 60 * 24)
    );

    const options = {
      original: {
        cache_key: original.cacheKey,
        start_date: original.startDate,
        end_date: original.endDate,
        duration: originalDuration
      },
      rescheduled_versions: rescheduled.map(r => ({
        cache_key: r.cacheKey,
        start_date: r.startDate,
        end_date: r.endDate,
        duration: Math.ceil(
          (new Date(r.endDate) - new Date(r.startDate)) / (1000 * 60 * 60 * 24)
        ),
        created_at: r.createdAt
      })),
      suggested_dates: generateSuggestedDates(original.startDate, originalDuration)
    };

    console.log('Reschedule options generated successfully');
    console.log('=== RESCHEDULE OPTIONS REQUEST END ===');
    return res.json(options);
  } catch (err) {
    console.error('Reschedule options error:', err);
    return res.status(500).json({ error: 'Failed to get reschedule options' });
  }
});

// Helper function to generate suggested date ranges
function generateSuggestedDates(originalStart, duration) {
  const suggestions = [];
  const baseDate = new Date(originalStart);
  
  // Same dates next year
  const nextYear = new Date(baseDate);
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  suggestions.push({
    type: 'next_year',
    start_date: nextYear.toISOString().slice(0, 10),
    end_date: new Date(nextYear.getTime() + (duration * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10),
    description: 'Same dates next year'
  });

  // Same dates next month
  const nextMonth = new Date(baseDate);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  suggestions.push({
    type: 'next_month',
    start_date: nextMonth.toISOString().slice(0, 10),
    end_date: new Date(nextMonth.getTime() + (duration * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10),
    description: 'Same dates next month'
  });

  // Weekend version (if not already weekend)
  const weekendStart = new Date(baseDate);
  const dayOfWeek = weekendStart.getDay();
  if (dayOfWeek !== 0 && dayOfWeek !== 6) {
    // Move to next Saturday
    const daysToSaturday = (6 - dayOfWeek + 7) % 7;
    weekendStart.setDate(weekendStart.getDate() + daysToSaturday);
    suggestions.push({
      type: 'weekend_start',
      start_date: weekendStart.toISOString().slice(0, 10),
      end_date: new Date(weekendStart.getTime() + (duration * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10),
      description: 'Weekend start version'
    });
  }

  return suggestions;
}

module.exports = router;
