import express from 'express';
import User from '../models/User.js';
import Scholarship from '../models/Scholarship.js';
import Application from '../models/Application.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/metrics', requireAuth, requireAdmin, async (_req, res) => {
  const [users, scholarships, applications, students] = await Promise.all([
    User.countDocuments(),
    Scholarship.countDocuments(),
    Application.countDocuments(),
    User.countDocuments({ role: 'student' }),
  ]);

  res.json({
    users,
    students,
    scholarships,
    applications,
  });
});

export default router;