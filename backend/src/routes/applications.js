import express from 'express';
import Application from '../models/Application.js';
import Scholarship from '../models/Scholarship.js';
import Notification from '../models/Notification.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  const applications = await Application.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .populate('scholarshipId')
    .lean();

  res.json({
    applications: applications.map((application) => ({
      id: application._id,
      scholarshipId: application.scholarshipId?._id || application.scholarshipId,
      scholarshipTitle: application.scholarshipId?.title || 'Unknown Scholarship',
      provider: application.scholarshipId?.provider || '',
      status: application.status,
      submittedOn: application.submittedOn,
      nextAction: application.nextAction || '',
      documentCount: application.documents?.length || 0,
      documents: application.documents || [],
    })),
  });
});

router.get('/admin', requireAuth, requireAdmin, async (_req, res) => {
  const applications = await Application.find()
    .sort({ createdAt: -1 })
    .populate('scholarshipId')
    .populate('userId', 'name email role')
    .lean();

  res.json({ applications });
});

router.get('/summary', requireAuth, async (req, res) => {
  const applications = await Application.find({ userId: req.user._id }).lean();
  const scholarships = await Scholarship.find().lean();

  const deadlineWarnings = scholarships.filter((scholarship) => {
    if (!scholarship.deadline) return false;
    const deadline = new Date(scholarship.deadline).getTime();
    const daysLeft = Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 && daysLeft <= 3;
  });

  const missingDocs = applications.filter((application) => (application.documents?.length || 0) === 0);

  res.json({
    notifications: [
      ...deadlineWarnings.map((scholarship) => ({
        type: 'deadline',
        title: 'Deadline in 3 days',
        message: scholarship.title,
      })),
      ...missingDocs.map((application) => ({
        type: 'document',
        title: 'Document Missing',
        message: application.scholarshipId || 'One of your applications needs documents',
      })),
    ],
  });
});

router.put('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  const { status, nextAction } = req.body;
  const application = await Application.findByIdAndUpdate(
    req.params.id,
    { status, nextAction },
    { new: true }
  ).populate('scholarshipId').populate('userId', 'name email').lean();

  if (!application) return res.status(404).json({ message: 'Application not found' });

  await Notification.create({
    userId: application.userId._id,
    type: status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info',
    title: 'Application status updated',
    message: `${application.scholarshipId?.title || 'Your application'} is now ${status}.`,
    applicationId: application._id,
    scholarshipId: application.scholarshipId?._id,
  });

  res.json({
    application: {
      id: application._id,
      scholarshipTitle: application.scholarshipId?.title || 'Unknown Scholarship',
      userName: application.userId?.name || '',
      userEmail: application.userId?.email || '',
      status: application.status,
      nextAction: application.nextAction || '',
      submittedOn: application.submittedOn,
      documents: application.documents || [],
    },
  });
});

export default router;