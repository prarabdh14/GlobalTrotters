const express = require('express');
const crypto = require('crypto');
const prisma = require('../config/database');
const router = express.Router();

// Lazy Gemini import to keep startup fast
let genAI = null;
async function getGemini() {
  if (!genAI) {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

const MODEL = process.env.GEMINI_MODEL || 'models/gemini-1.5-pro';

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

    Include recommended modes of transport for each journey leg (flights, trains, buses, taxis), highlighting options that fit the user’s budget.

    Suggest top popular tourist attractions and must-visit sites in the destination city, focusing on those that match the user’s travel preferences (e.g., if they prefer museums and natural places, prioritize renowned museums, national parks, gardens).

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

    Use clear, concise language suitable for an easy-to-follow travel plan.`
        `Constraints:\n` +
        `- Reflect travel time on first/last day if applicable.\n` +
        `- Prefer public transport by default unless preferences say otherwise.\n` +
        `- 3–6 activities per day, balanced (sightseeing, meals, rest).\n` +
        `- One currency across outputs; specify currency.\n` +
        `- Keep costs realistic for season/region.\n\n` +
        `Output:\n` +
        `STRICT JSON ONLY, matching this schema (no prose outside JSON):\n` +
        `${JSON.stringify(JSON_SCHEMA, null, 2)}\n` +
        `If JSON cannot be produced, fallback to well-structured markdown.`;
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
    const { source, destination, start_date, end_date, preferences, budget, force_refresh } = req.body || {};
    if (!source || !destination || !start_date || !end_date) {
      return res.status(400).json({ error: 'source, destination, start_date, end_date are required' });
    }

    const cacheKey = makeCacheKey({ source, destination, start_date, end_date, preferences, budget, model: MODEL });

    if (!force_refresh) {
      const cached = await prisma.aiItinerary.findUnique({ where: { cacheKey } });
      if (cached) return res.json(cached);
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const prompt = buildPrompt({ source, destination, start_date, end_date, preferences, budget });
    const client = await getGemini();
    const model = client.getGenerativeModel({ model: MODEL });
    const rsp = await model.generateContent(prompt);
    const text = rsp.response.text();

    let parsed = null;
    try { parsed = JSON.parse(text); } catch {}

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

    return res.json(created);
  } catch (err) {
    console.error('AI plan error:', err);
    return res.status(500).json({ error: 'Failed to generate itinerary' });
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
