import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import Scholarship from '../models/Scholarship.js';
import Activity from '../models/Activity.js'; 
import { buildVisibleScholarshipQuery } from '../utils/scholarshipVisibility.js';

const router = express.Router();

// FEATURE 1: Admin logs/adds a brand new scholarship scheme
router.post('/scholarships', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, provider, amount, deadline, description, applicationLink } = req.body;

    if (!title || !provider) {
      return res.status(400).json({ success: false, message: 'Title and provider are required.' });
    }

    const newScholarship = new Scholarship({
      title,
      provider,
      amount,
      deadline: deadline ? new Date(deadline) : null,
      description,
      applicationLink,
      status: 'active',
      isLive: true, // Visible to students immediately
      sourcePortal: 'Manual'
    });

    await newScholarship.save();
    return res.status(201).json({ success: true, message: 'Scholarship added successfully!', scholarship: newScholarship });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// FEATURE 3A: Admin marks an active scholarship as EXPIRED
router.patch('/scholarships/:id/expire', requireAuth, requireAdmin, async (req, res) => {
  try {
    const updated = await Scholarship.findByIdAndUpdate(
      req.params.id,
      { status: 'expired', isLive: false }, // Setting isLive to false pulls it from student dashboard
      { new: true }
    );
    return res.json({ success: true, message: 'Scholarship marked as expired.', updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// FEATURE 3B: Admin DELETES/REMOVES a scholarship completely
router.delete('/scholarships/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await Scholarship.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Scholarship permanently removed from database.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// FEATURE 2: Admin views all registered students and their live platform activity logs
router.get('/users-activity', requireAuth, requireAdmin, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').lean();
    const actionsLog = await Activity.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return res.json({ users: students, activities: actionsLog });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Admin Dashboard Analytics Metric Counters (Updated to include legacy data)
router.get('/metrics', requireAuth, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    
    // Counts items where isLive is NOT false AND status is NOT expired
    const totalActiveSchemes = await Scholarship.countDocuments(buildVisibleScholarshipQuery());
    
    return res.json({ users: totalUsers, students: totalStudents, scholarships: totalActiveSchemes, applications: 0 });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;