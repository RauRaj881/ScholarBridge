import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Scholarship from '../models/Scholarship.js';
import { buildVisibleScholarshipQuery } from '../utils/scholarshipVisibility.js';

const router = express.Router();

// FEATURE 4: Student views active/live modifications automatically
router.get('/available-scholarships', requireAuth, async (req, res) => {
  try {
    const feed = await Scholarship.find(buildVisibleScholarshipQuery()).sort({ createdAt: -1 });
    return res.json({ success: true, scholarships: feed });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;