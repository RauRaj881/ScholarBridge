import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import Scholarship from '../models/Scholarship.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({ destination: (_req, _file, cb) => cb(null, uploadDir), filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g,'_')}`) });
const upload = multer({ storage });

// Accept CSV file and import scholarships
router.post('/scholarships', requireAuth, requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'CSV file required' });
  try {
    const csv = fs.readFileSync(req.file.path, 'utf8');
    const records = parse(csv, { columns: true, skip_empty_lines: true });

    const created = [];
    for (const row of records) {
      // Normalize basic fields
      const title = (row.title || row.Title || '').trim();
      if (!title) continue;
      const provider = (row.provider || row.Provider || '').trim();
      const existing = await Scholarship.findOne({ title: new RegExp(`^${escapeRegex(title)}$`, 'i'), provider: new RegExp(escapeRegex(provider || ''), 'i') });
      if (existing) continue; // skip duplicates

      const doc = {
        title,
        provider,
        amount: row.amount || row.Amount || '',
        deadline: row.deadline ? new Date(row.deadline) : null,
        states: parseList(row.states || row.States),
        courses: parseList(row.courses || row.Courses),
        categories: parseList(row.categories || row.Categories),
        incomeLimit: row.incomeLimit ? Number((row.incomeLimit || '').replace(/[^0-9.-]/g, '')) : undefined,
        yearLevels: parseList(row.yearLevels || row.YearLevels),
        requiredDocuments: parseList(row.requiredDocuments || row.RequiredDocuments),
        applicationLink: row.applicationLink || row.ApplicationLink || '',
        description: row.description || row.Description || '',
        featured: (row.featured || '').toLowerCase() === 'true',
        tags: parseList(row.tags || row.Tags),
      };

      const createdSch = await Scholarship.create(doc);
      created.push(createdSch);
    }

    res.json({ created: created.length });
  } catch (err) {
    console.error('Import error', err);
    res.status(500).json({ message: 'Import failed' });
  }
});

function parseList(v) {
  if (!v) return [];
  return v.split(/[,;|]/).map(s=>s.trim()).filter(Boolean);
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default router;