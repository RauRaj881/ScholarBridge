import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  type: { type: String, default: 'info' },
  title: String,
  message: String,
  read: { type: Boolean, default: false },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  scholarshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship' },
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);