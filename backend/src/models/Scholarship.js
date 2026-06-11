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
  requiredDocuments: [String],
  applicationLink: String,
  status: { type: String, default: 'Open' },
  tags: [String],
  description: String,
  featured: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Scholarship || mongoose.model('Scholarship', ScholarshipSchema);
