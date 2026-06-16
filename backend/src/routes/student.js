import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Scholarship from '../models/Scholarship.js';

const router = express.Router();

// FEATURE 4: Student views active/live modifications automatically
router.get('/available-scholarships', requireAuth, async (req, res) => {
  try {
    // Only fetch scholarships where admin has set isLive to true and status is active
    const feed = await Scholarship.find({ isLive: true, status: 'active' }).sort({ createdAt: -1 });
    return res.json({ success: true, scholarships: feed });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;