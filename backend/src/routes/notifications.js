import express from 'express';
import Notification from '../models/Notification.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    notifications: notifications.map((notification) => ({
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
    })),
  });
});

router.patch('/:id/read', requireAuth, async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true },
    { new: true }
  ).lean();

  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  res.json({ ok: true });
});

export default router;