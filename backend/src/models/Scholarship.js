import mongoose from 'mongoose';

const ScholarshipSchema = new mongoose.Schema({
  title: String,
  provider: String,
  amount: String,
  deadline: Date,
  states: [String],
  courses: [String],
  categories: [String],
  incomeLimit: Number,
  yearLevels: [String],
  eligibility: [String],
  requiredDocuments: [String],
  applicationLink: String,
  status: { type: String, default: 'Open' },
  tags: [String],
  description: String,
  featured: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Scholarship || mongoose.model('Scholarship', ScholarshipSchema);
