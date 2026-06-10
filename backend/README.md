# ScholarBridge Backend

Backend is an Express API using MongoDB (Mongoose). Environment variables (see `.env.example`) are required:

- `MONGODB_URI` - Atlas connection string
- `JWT_SECRET` - secret for signing tokens
- `AI_API_KEY` - provider key for AI features

Run locally:

```bash
cd ScholarBridge/backend
npm install
npm run dev
```

Seeding sample data:

```bash
cd ScholarBridge/backend
npm run seed
```

Frontend (development):

```bash
cd ScholarBridge/frontend
npm install
npm run dev
```

File uploads

- Apply to a scholarship by POSTing multipart/form-data to `/api/scholarships/:id/apply` with field name `documents` (one or more files). Uploaded files are stored under `backend/uploads` and an `Application` record is created.

AI

- Configure `AI_API_KEY` in `.env` to enable `/api/ai/chat` and `/api/ai/recommend` endpoints. Without a key the endpoints return static placeholders.

