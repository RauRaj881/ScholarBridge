import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Scholarship from '../models/Scholarship.js';
import { buildVisibleScholarshipQuery } from '../utils/scholarshipVisibility.js';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

// ──────────────────────────────────────────────
// 1. Initialise Google Gen AI SDK
// ──────────────────────────────────────────────
// Since index.js already calls dotenv, process.env values are globally available!
const rawKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
const activeKey = rawKey && rawKey !== 'YOUR_GEMINI_API_KEY_HERE' ? rawKey : '';

// Initialize the SDK using the global configuration key
const ai = activeKey ? new GoogleGenAI({ apiKey: activeKey }) : null;

async function callGemini(userMessage, systemInstruction) {
  if (!ai) {
    throw new Error('Gemini API key not configured or initialized');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userMessage,
    config: {
      systemInstruction,
      temperature: 0.4,
    },
  });

  return response.text || null;
}

// ──────────────────────────────────────────────
// 2. Local fallback helpers
// ──────────────────────────────────────────────
function normalize(text = '') {
  return String(text).toLowerCase();
}

function scoreScholarship(scholarship, message) {
  const eligibility = scholarship.eligibility || {};

  const haystack = [
    scholarship.title,
    scholarship.provider,
    scholarship.description,
    ...(eligibility.states || []),
    ...(eligibility.courses || []),
    ...(eligibility.categories || []),
    ...(scholarship.tags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const words = normalize(message).split(/\s+/).filter(Boolean);
  return (
    words.reduce((score, word) => score + (haystack.includes(word) ? 2 : 0), 0) +
    (scholarship.featured ? 1 : 0)
  );
}

async function fallbackRecommendations(message) {
  const scholarships = await Scholarship.find({})
    .sort({ featured: -1, deadline: 1 })
    .limit(56)
    .lean();

  return scholarships
    .map((s) => ({ scholarship: s, score: scoreScholarship(s, message) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ scholarship }) => scholarship);
}

// ──────────────────────────────────────────────
// POST /api/ai/chat  — conversational chat
// ──────────────────────────────────────────────
router.post('/chat', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (!activeKey) {
      return res.json({
        mode: 'local',
        reply:
          'Hi! I am ScholarBridge AI. Gemini AI is not active yet — add your GEMINI_API_KEY in backend/.env and restart the server to unlock real AI replies.',
        recommendations: [],
      });
    }

    const systemPrompt = `You are "ScholarBridge AI", a friendly AI assistant for the ScholarBridge scholarship portal in India.
Help students find, understand and apply for scholarships.
Keep answers clear, concise and helpful. Respond in the same language the user writes in.`;

    const text = await callGemini(message, systemPrompt);
    const reply = text?.trim() || 'Sorry, I could not generate a response. Please try again.';

    return res.json({ mode: 'gemini', reply, recommendations: [] });
  } catch (err) {
    console.error('AI chat error:', err.message || err);
    return res.status(500).json({ message: 'AI chat error', error: err.message });
  }
});

// ──────────────────────────────────────────────
// POST /api/ai/recommend  — scholarship recommendations
// ──────────────────────────────────────────────
router.post('/recommend', requireAuth, async (req, res) => {
  try {
    if (!activeKey) {
      const local = await fallbackRecommendations('recommend scholarships');
      return res.json({
        mode: 'local',
        suggestions: local.map((item) => ({
          title: item.title,
          provider: item.provider,
          amount: item.amount,
          id: item._id,
        })),
      });
    }

    const user = req.user || {};
    const andConditions = [];

    if (user.state) {
      andConditions.push({
        $or: [
          { 'eligibility.states': { $exists: false } },
          { 'eligibility.states': { $size: 0 } },
          { 'eligibility.states': { $regex: new RegExp(user.state, 'i') } },
          { 'eligibility.states': { $regex: /All India/i } }
        ]
      });
    }

    if (user.course) {
      andConditions.push({
        $or: [
          { 'eligibility.courses': { $exists: false } },
          { 'eligibility.courses': { $size: 0 } },
          { 'eligibility.courses': { $regex: new RegExp(user.course, 'i') } }
        ]
      });
    }

    if (user.category) {
      andConditions.push({
        $or: [
          { 'eligibility.categories': { $exists: false } },
          { 'eligibility.categories': { $size: 0 } },
          { 'eligibility.categories': { $regex: new RegExp(user.category, 'i') } }
        ]
      });
    }

    if (user.income !== undefined && user.income !== null) {
      andConditions.push({
        $or: [
          { 'eligibility.incomeLimit': { $exists: false } },
          { 'eligibility.incomeLimit': null },
          { 'eligibility.incomeLimit': { $gte: user.income } }
        ]
      });
    }

    const query = buildVisibleScholarshipQuery();
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    // Retrieve matching scholarships to ground the prompt
    let scholarships = await Scholarship.find(query).limit(10).lean();

    // Fallback: If no scholarships match this specific criteria, load open scholarships
    if (!scholarships || scholarships.length === 0) {
      scholarships = await Scholarship.find(buildVisibleScholarshipQuery()).limit(10).lean();
    }

    const systemPrompt = `You are "ScholarBridge AI", an AI recommendation engine.
Given a student profile, output exactly 5 scholarship recommendations as a valid JSON array.
Each object must have: "title", "provider", "amount", "id" — using IDs from the catalog below.
Output raw JSON only. No markdown, no code fences.

Catalog:
${JSON.stringify(
  scholarships.map((s) => ({
    id: s._id.toString(),
    title: s.title,
    provider: s.provider,
    amount: s.amount,
  }))
)}`;

    const prompt = `Student profile: ${JSON.stringify(req.user)}`;
    const out = await callGemini(prompt, systemPrompt);

    try {
      const cleaned = out.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return res.json({ mode: 'gemini', suggestions: parsed });
    } catch (parseErr) {
      console.error('AI recommend parse error:', parseErr.message);
      return res.status(500).json({ message: 'Parse error', error: parseErr.message });
    }
  } catch (err) {
    console.error('AI recommend error:', err.message || err);
    return res.status(500).json({ message: 'AI error', error: err.message });
  }
});

export default router;
