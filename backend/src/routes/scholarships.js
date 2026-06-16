import express from 'express';
import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Activity from '../models/Activity.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// 1. DATABASE SCHEMA & MODEL DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

const EligibilitySchema = new mongoose.Schema(
  {
    states: [{ type: String }],
    courses: [{ type: String }],
    categories: [{ type: String }],
    incomeLimit: { type: Number },
    yearLevel: { type: String },
  },
  { _id: false }
);

const ScholarshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    provider: { type: String, required: true },
    amount: String,
    deadline: Date,
    eligibility: EligibilitySchema,
    states: [{ type: String }],
    courses: [{ type: String }],
    categories: [{ type: String }],
    incomeLimit: { type: Number },
    yearLevels: [{ type: String }],
    requiredDocuments: [String],
    applicationLink: String,
    status: { type: String, enum: ['active', 'expired'], default: 'active' },
    tags: [String],
    description: String,
    featured: { type: Boolean, default: false },
    sourcePortal: { type: String, enum: ['NSP', 'Bihar-PMS', 'Private', 'Manual'], default: 'Manual' },
    externalLink: String,
    isLive: { type: Boolean, default: true }
  }, 
  { timestamps: true }
);

ScholarshipSchema.index({ 'eligibility.states': 1 });
ScholarshipSchema.index({ 'eligibility.categories': 1 });

ScholarshipSchema.pre('save', function (next) {
  if (!this.eligibility) {
    this.eligibility = {};
  }
  if (this.states && this.states.length) {
    this.eligibility.states = this.states;
  } else if (this.eligibility.states && this.eligibility.states.length) {
    this.states = this.eligibility.states;
  }
  if (this.courses && this.courses.length) {
    this.eligibility.courses = this.courses;
  } else if (this.eligibility.courses && this.eligibility.courses.length) {
    this.courses = this.eligibility.courses;
  }
  if (this.categories && this.categories.length) {
    this.eligibility.categories = this.categories;
  } else if (this.eligibility.categories && this.eligibility.categories.length) {
    this.categories = this.eligibility.categories;
  }
  if (this.incomeLimit !== undefined) {
    this.eligibility.incomeLimit = this.incomeLimit;
  } else if (this.eligibility.incomeLimit !== undefined) {
    this.incomeLimit = this.eligibility.incomeLimit;
  }
  if (this.yearLevels && this.yearLevels.length) {
    this.eligibility.yearLevel = this.yearLevels[0];
  } else if (this.eligibility.yearLevel) {
    this.yearLevels = [this.eligibility.yearLevel];
  }
  next();
});

const Scholarship = mongoose.models.Scholarship || mongoose.model('Scholarship', ScholarshipSchema);

const logActivity = async (userId, action, details) => {
  try {
    if (!userId) return;
    await Activity.create({ userId, action, details });
  } catch (err) {
    console.error('❌ Activity trace writing failure:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. EXPRESS CONTROLLER ROUTING ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/scholarships
 * @desc    FEATURE 4: Fetch active, live scholarships, including legacy database records
 */
router.get('/', async (req, res) => {
  try {
    // Finds items where (isLive is true OR doesn't exist) AND (status is active OR doesn't exist)
    const activeCatalog = await Scholarship.find({
      $and: [
        { isLive: { $ne: false } },
        { status: { $ne: 'expired' } }
      ]
    })
    .sort({ featured: -1, createdAt: -1 })
    .lean();
    
    return res.json({ 
      success: true,
      scholarships: activeCatalog 
    });
  } catch (error) {
    console.error('❌ Student Catalog Error:', error.message);
    return res.status(500).json({ 
      success: false, 
      scholarships: [],
      message: 'Failed to balance active dashboard items' 
    });
  }
});

/**
 * @route   POST /api/scholarships/eligibility
 * @desc    Execute index-optimized matching checks across data arrays for the Eligibility component
 */
router.post('/eligibility', async (req, res) => {
  try {
    const { state, category, course, income, userId } = req.body;
    const filterQuery = {};

    if (state) {
      filterQuery['eligibility.states'] = { $in: [state, 'All', 'all'] };
    }
    if (category) {
      filterQuery['eligibility.categories'] = { $in: [category, 'All', 'all'] };
    }
    if (course) {
      filterQuery['eligibility.courses'] = { $in: [course, 'All', 'all'] };
    }
    if (income) {
      filterQuery['eligibility.incomeLimit'] = { $gte: Number(income) };
    }

    const filteredRecords = await Scholarship.find(filterQuery).sort({ featured: -1 }).lean();
    
    if (userId) {
      await logActivity(
        userId,
        'Checked Eligibility',
        `Criteria: State [${state || 'Any'}], Course [${course || 'Any'}], Income Boundary [₹${income || 'Any'}]`
      );
    }

    return res.json({
      success: true,
      count: filteredRecords.length,
      scholarships: filteredRecords
    });
  } catch (error) {
    console.error('❌ Eligibility Filter Exception [POST /eligibility]:', error.message);
    return res.status(500).json({ success: false, message: 'Database filtering exception' });
  }
});

/**
 * @route   POST /api/scholarships/apply
 * @desc    Submit a user application record for tracking inside the workflow dashboard
 */
router.post('/apply', async (req, res) => {
  try {
    const { userId, scholarshipId } = req.body;

    if (!userId || !scholarshipId) {
      return res.status(400).json({ success: false, message: 'Missing user reference or target scholarship identification' });
    }

    const existingApplication = await Application.findOne({ userId, scholarshipId });
    if (existingApplication) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already submitted an active application tracker for this scholarship scheme.' 
      });
    }

    const newApplication = new Application({
      userId,
      scholarshipId,
      status: 'submitted',
      nextAction: 'Awaiting administrative credentials assessment'
    });

    await newApplication.save();

    const targetScholarship = await Scholarship.findById(scholarshipId).select('title').lean();
    await logActivity(
      userId,
      'Submitted Application',
      `Applied for Scheme: ${targetScholarship?.title || 'Unknown Portal'}`
    );

    return res.json({
      success: true,
      message: 'Application workflow established and tracked successfully',
      application: newApplication
    });
  } catch (error) {
    console.error('❌ Application Submission Tracking Error [POST /apply]:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to process target tracking intent' });
  }
});

/**
 * @route   GET /api/scholarships/applications/:userId
 * @desc    Fetch all active historical tracker states for an individual logged-in student
 */
router.get('/applications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const trackingHistory = await Application.find({ userId })
      .populate('scholarshipId', 'title provider amount deadline status')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      applications: trackingHistory
    });
  } catch (error) {
    console.error('❌ Workflow Application Retrieval Error [GET /applications/:userId]:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to collect dashboard workflow instances' });
  }
});

export default router;