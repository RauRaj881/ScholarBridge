import express from 'express';
import Scholarship from '../models/Scholarship.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// ensure upload dir
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g,'_')}`)
});
const upload = multer({ storage });

// public list
router.get('/', async (req, res) => {
  const items = await Scholarship.find().sort({ featured: -1, deadline: 1 }).limit(200);
  res.json({ scholarships: items });
});

router.get('/eligibility', async (req, res) => {
  const {
    state,
    course,
    category,
    income,
    yearLevel,
    search,
  } = req.query;

  const scholarships = await Scholarship.find({ status: 'Open' }).sort({ featured: -1, deadline: 1 });
  const incomeValue = Number(income || 0);

  const matched = scholarships.filter((scholarship) => {
    const matchesState = !state || !scholarship.states?.length || scholarship.states.some((item) => item.toLowerCase().includes(state.toLowerCase()));
    const matchesCourse = !course || !scholarship.courses?.length || scholarship.courses.some((item) => item.toLowerCase().includes(course.toLowerCase()));
    const matchesCategory = !category || !scholarship.categories?.length || scholarship.categories.some((item) => item.toLowerCase().includes(category.toLowerCase()));
    const matchesYear = !yearLevel || !scholarship.yearLevels?.length || scholarship.yearLevels.some((item) => item.toLowerCase().includes(yearLevel.toLowerCase()));
    const matchesIncome = !incomeValue || !scholarship.incomeLimit || incomeValue <= scholarship.incomeLimit;
    const matchesSearch = !search || [scholarship.title, scholarship.provider, scholarship.description].join(' ').toLowerCase().includes(search.toLowerCase());

    return matchesState && matchesCourse && matchesCategory && matchesYear && matchesIncome && matchesSearch;
  });

  res.json({ count: matched.length, scholarships: matched });
});

router.get('/:id', async (req, res) => {
  const item = await Scholarship.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json({ scholarship: item });
});

// apply to a scholarship (multipart file upload)
router.post('/:id/apply', requireAuth, upload.array('documents', 5), async (req, res) => {
  try {
    const scholarshipId = req.params.id;
    const userId = req.user._id;
    const scholarship = await Scholarship.findById(scholarshipId).lean();
    const docs = (req.files || []).map(f => ({ originalName: f.originalname, fileName: f.filename, path: path.relative(process.cwd(), f.path), size: f.size, mimeType: f.mimetype }));
    const application = await Application.create({ userId, scholarshipId, documents: docs, status: 'submitted', submittedOn: new Date() });
    await Notification.create({
      userId,
      type: 'success',
      title: 'Application submitted',
      message: scholarship ? `Your application for ${scholarship.title} was received.` : 'Your application was received.',
      applicationId: application._id,
      scholarshipId,
    });
    res.status(201).json({ application });
  } catch (err) {
    console.error('Apply error', err);
    res.status(500).json({ message: 'Apply failed' });
  }
});

// admin creates/edits
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const payload = req.body;
  const item = await Scholarship.create(payload);
  res.status(201).json({ scholarship: item });
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const item = await Scholarship.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json({ scholarship: item });
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const item = await Scholarship.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json({ ok: true });
});

export default router;
