import mongoose from 'mongoose';

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

const ScholarshipSchema = new mongoose.Schema({
  title: String,
  provider: String,
  amount: String,
  deadline: Date,
  eligibility: EligibilitySchema, // nested eligibility sub‑document
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
}, { timestamps: true });

// Design separate database indexes to optimize filter speed (avoiding parallel array multikey limitations)
ScholarshipSchema.index({ 'eligibility.states': 1 });
ScholarshipSchema.index({ 'eligibility.categories': 1 });

// Automatically sync top-level and nested eligibility fields on save
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

export default mongoose.models.Scholarship || mongoose.model('Scholarship', ScholarshipSchema);
