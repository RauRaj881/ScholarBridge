import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });


import authRoutes from './routes/auth.js';
import scholarshipRoutes from './routes/scholarships.js';
import aiRoutes from './routes/ai.js';
import applicationRoutes from './routes/applications.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';
import importRoutes from './routes/import.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Connect MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarbridge';
mongoose.connect(MONGODB_URI, { autoIndex: true })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => console.error('MongoDB error', err));

app.use('/api/auth', authRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/import', importRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'ScholarBridge API' }));



const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

if (process.env.NODE_ENV === 'production') {
  // serve frontend if built into ../frontend/dist
  const staticPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(staticPath));
  app.get('*', (_req, res) => res.sendFile(path.join(staticPath, 'index.html')));
}

app.listen(port, () => console.log(`ScholarBridge API listening on http://localhost:${port}`));
