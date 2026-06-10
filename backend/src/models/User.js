import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  state: String,
  course: String,
  courseGroup: String,
  income: Number,
  category: String,
  year: String,
  college: String,
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
