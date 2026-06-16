import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., "Logged In", "Submitted Application", "Checked Eligibility"
  details: { type: String },
}, { timestamps: true });

export default mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);