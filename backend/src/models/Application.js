import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scholarshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship' },
  status: { type: String, default: 'submitted' },
  submittedOn: { type: Date, default: Date.now },
  nextAction: String,
  documents: [
    {
      originalName: String,
      fileName: String,
      path: String,
      size: Number,
      mimeType: String
    }
  ],
}, { timestamps: true });

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
