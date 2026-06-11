import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../src/models/User.js'
import Scholarship from '../src/models/Scholarship.js'
import bcrypt from 'bcrypt'
import { scholarships } from './scholarships_data.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarbridge'
async function main() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to DB')
  await Scholarship.deleteMany({})
  await User.deleteMany({})

  const adminPass = await bcrypt.hash('adminpass', 10)
  const admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: adminPass, role: 'admin' })
  const userPass = await bcrypt.hash('studentpass', 10)
  const user = await User.create({ name: 'Student', email: 'student@example.com', password: userPass, role: 'student' })

  await Scholarship.insertMany(scholarships)

  console.log(`Seed complete: created admin, student, and ${scholarships.length} real scholarships`)
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
