import express from 'express';
import axios from 'axios';
import { requireAuth } from '../middleware/auth.js';
import dotenv from 'dotenv';
import Scholarship from '../models/Scholarship.js';
dotenv.config();

const router = express.Router();

async function callOpenAI(prompt) {
  const key = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  if (!key) throw new Error('AI key not configured');

  const url = 'https://api.openai.com/v1/chat/completions';
  const payload = {
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 512
  };
  const resp = await axios.post(url, payload, { headers: { Authorization: `Bearer ${key}` } });
  return resp.data?.choices?.[0]?.message?.content || null;
}

function normalize(text = '') {
  return String(text).toLowerCase();
}

function scoreScholarship(scholarship, message) {
  const haystack = [
    scholarship.title,
    scholarship.provider,
    scholarship.description,
    ...(scholarship.states || []),
    ...(scholarship.courses || []),
    ...(scholarship.categories || []),
    ...(scholarship.tags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const words = normalize(message).split(/\s+/).filter(Boolean);
  return words.reduce((score, word) => score + (haystack.includes(word) ? 2 : 0), 0) + (scholarship.featured ? 1 : 0);
}

async function fallbackRecommendations(message) {
  const scholarships = await Scholarship.find({}).sort({ featured: -1, deadline: 1 }).limit(40).lean();
  const ranked = scholarships
    .map((scholarship) => ({ scholarship, score: scoreScholarship(scholarship, message) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ scholarship }) => scholarship);

  return ranked;
}

function buildFallbackReply(message, recommendations = []) {
  const lower = normalize(message);
  const intro = lower.includes('help') || lower.includes('how')
    ? 'I can help you find scholarships by state, course, category, income, and year level.'
    : 'I can search the catalog and suggest matching scholarships.';

  const bullets = recommendations.length
    ? recommendations.map((item) => `- ${item.title} (${item.provider || 'Provider not listed'})${item.amount ? ` · ${item.amount}` : ''}`).join('\n')
    : '- No close matches found yet. Try adding your state, course, category, and income.';

  return `${intro}\n\nTop matches from the current catalog:\n${bullets}\n\nIf you want, send your state, course, category, and annual family income, and I’ll narrow it further.`;
}

// simple recommend endpoint — uses AI provider if configured
router.post('/recommend', requireAuth, async (req, res) => {
  try {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
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

    const prompt = `Given the student profile: ${JSON.stringify(req.user)}\nReturn 5 scholarship recommendations as a JSON array of titles.`;
    const out = await callOpenAI(prompt);
    // try to parse JSON from the response
    try {
      const parsed = JSON.parse(out);
      return res.json({ mode: 'openai', suggestions: parsed });
    } catch {
      return res.json({ mode: 'openai', suggestions: [out] });
    }
  } catch (err) {
    console.error('AI recommend error', err.message || err);
    res.status(500).json({ message: 'AI error', error: err.message });
  }
});

// chat endpoint — forwards message to AI provider when available
router.post('/chat', requireAuth, async (req, res) => {
  try {
    const { message } = req.body ?? {};
    if (!message) return res.status(400).json({ message: 'Message required' });
    if (!process.env.AI_API_KEY) {
      const recommendations = await fallbackRecommendations(message);
      return res.json({
        mode: 'local',
        reply: buildFallbackReply(message, recommendations),
        recommendations: recommendations.map((item) => ({
          id: item._id,
          title: item.title,
          provider: item.provider,
          amount: item.amount,
          deadline: item.deadline,
        })),
      });
    }
    const reply = await callOpenAI(message);
    res.json({ mode: 'openai', reply });
  } catch (err) {
    console.error('AI chat error', err.message || err);
    res.status(500).json({ message: 'AI error', error: err.message });
  }
});

export default router;
