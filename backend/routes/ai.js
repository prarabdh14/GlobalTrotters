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

function makeCacheKey({ source, destination, start_date, end_date, preferences, budget, model }) {
  const norm = {
    source: String(source || '').trim().toLowerCase(),
    destination: String(destination || '').trim().toLowerCase(),
    start_date: new Date(start_date).toISOString().slice(0,10),
    end_date: new Date(end_date).toISOString().slice(0,10),
    preferences: preferences ? JSON.stringify(preferences, Object.keys(preferences).sort()) : '{}',
    budget: String(budget || '').trim().toLowerCase(),
    model
  };
  const payload = `${norm.source}|${norm.destination}|${norm.start_date}|${norm.end_date}|${norm.preferences}|${norm.budget}|${norm.model}`;
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

    const cacheKey = makeCacheKey({ source, destination, start_date, end_date, preferences, budget, model: MODEL });
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

module.exports = router;
