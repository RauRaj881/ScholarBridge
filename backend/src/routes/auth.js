import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

router.post('/register', async (req, res) => {
  const { name, email, password, role = 'student' } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ message: 'User exists' });
  const hash = await bcrypt.hash(password, 10);
  const u = await User.create({ name, email: email.toLowerCase(), password: hash, role });
  const token = jwt.sign({ id: u._id, role: u.role }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
  res.status(201).json({ user: { id: u._id, name: u.name, email: u.email, role: u.role } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
