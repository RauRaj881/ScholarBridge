import express from 'express';
import mongoose from 'mongoose';

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
    eligibility: EligibilitySchema, // Nested eligibility sub‑document
    
    // Top-level fields for backwards compatibility with frontend & legacy seed scripts
    states: [{ type: String }],
    courses: [{ type: String }],
    categories: [{ type: String }],
    incomeLimit: { type: Number },
    yearLevels: [{ type: String }],
    requiredDocuments: [String],
    applicationLink: String,
    status: { type: String, default: 'Open' },
    tags: [String],
    description: String,
    featured: { type: Boolean, default: false },
    
    // Metadata fields for live ingestion tracking
    sourcePortal: { type: String, enum: ['NSP', 'Bihar-PMS', 'Private', 'Manual'], default: 'Manual' },
    externalLink: String,
    isLive: { type: Boolean, default: false }
  }, 
  { timestamps: true }
);

// Optimize database search speeds (avoiding parallel array multikey restrictions)
ScholarshipSchema.index({ 'eligibility.states': 1 });
ScholarshipSchema.index({ 'eligibility.categories': 1 });

// Automatically sync top-level and nested eligibility fields during atomic database operations
ScholarshipSchema.pre('save', function (next) {
  if (!this.eligibility) {
    this.eligibility = {};
  }

  // Sync states
  if (this.states && this.states.length) {
    this.eligibility.states = this.states;
  } else if (this.eligibility.states && this.eligibility.states.length) {
    this.states = this.eligibility.states;
  }

  // Sync courses
  if (this.courses && this.courses.length) {
    this.eligibility.courses = this.courses;
  } else if (this.eligibility.courses && this.eligibility.courses.length) {
    this.courses = this.eligibility.courses;
  }

  // Sync categories
  if (this.categories && this.categories.length) {
    this.eligibility.categories = this.categories;
  } else if (this.eligibility.categories && this.eligibility.categories.length) {
    this.categories = this.eligibility.categories;
  }

  // Sync incomeLimit
  if (this.incomeLimit !== undefined) {
    this.eligibility.incomeLimit = this.incomeLimit;
  } else if (this.eligibility.incomeLimit !== undefined) {
    this.incomeLimit = this.eligibility.incomeLimit;
  }

  // Sync yearLevels <-> yearLevel (convert array to single string / vice versa)
  if (this.yearLevels && this.yearLevels.length) {
    this.eligibility.yearLevel = this.yearLevels[0];
  } else if (this.eligibility.yearLevel) {
    this.yearLevels = [this.eligibility.yearLevel];
  }

  next();
});

// Enforce model compiling patterns safely
const Scholarship = mongoose.models.Scholarship || mongoose.model('Scholarship', ScholarshipSchema);


// ─────────────────────────────────────────────────────────────────────────────
// 2. EXPRESS CONTROLLER ROUTING ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/scholarships
 * @desc    Fetch active ingestion opportunities to populate the frontend Overview grid
 */
router.get('/', async (req, res) => {
  try {
    // 1. Look for live, automated ingestion pipeline opportunities first
    let catalog = await Scholarship.find({ isLive: true }).sort({ featured: -1 }).lean();
    
    // 2. Safe Fallback: If the scraper hasn't run or collection is clearing, pull all items
    if (!catalog || catalog.length === 0) {
      catalog = await Scholarship.find({}).sort({ createdAt: -1 }).lean();
    }
    
    // 3. Object Wrapper Interface: Sends the keys exactly matching 'r.data.scholarships'
    return res.json({ 
      success: true,
      scholarships: catalog 
    });
  } catch (error) {
    console.error('❌ Base Catalog Routing Error [GET /]:', error.message);
    return res.status(500).json({ 
      success: false, 
      scholarships: [],
      message: 'Failed to extract active scholarship options',
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/scholarships/eligibility
 * @desc    Execute index-optimized matching checks across data arrays for the Eligibility component
 */
router.post('/eligibility', async (req, res) => {
  try {
    const { state, category, course, income } = req.body;
    
    // Build filter target query
    const filterQuery = { isLive: true };

    if (state) {
      filterQuery['eligibility.states'] = state;
    }
    if (category) {
      filterQuery['eligibility.categories'] = category;
    }
    if (course) {
      filterQuery['eligibility.courses'] = course;
    }
    if (income) {
      // Find entries where student's annual household income sits under the scholarship limit
      filterQuery['eligibility.incomeLimit'] = { $gte: Number(income) };
    }

    const filteredRecords = await Scholarship.find(filterQuery).lean();
    return res.json(filteredRecords);
  } catch (error) {
    console.error('❌ Eligibility Filter Exception [POST /eligibility]:', error.message);
    return res.status(500).json({ success: false, message: 'Database filtering exception' });
  }
});

export default router;