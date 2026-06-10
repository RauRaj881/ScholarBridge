import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../src/models/User.js'
import Scholarship from '../src/models/Scholarship.js'
import bcrypt from 'bcrypt'

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

  const samples = [
    {
      title: 'Central Sector Scholarship',
      provider: 'Government of India',
      amount: '₹20,000/year',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      states: ['All India'],
      courses: ['UG', 'PG'],
      categories: ['General', 'OBC', 'SC', 'ST'],
      incomeLimit: 800000,
      yearLevels: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
      requiredDocuments: ['Aadhaar', 'Income Certificate', 'Marksheet'],
      description: 'Merit-based scholarship for higher education students.',
      featured: true,
    },
    {
      title: 'Bihar Post Matric Scholarship',
      provider: 'Education Department, Bihar',
      amount: 'Tuition fee support',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      states: ['Bihar'],
      courses: ['10+2', 'UG', 'PG'],
      categories: ['SC', 'ST', 'OBC', 'EBC'],
      incomeLimit: 200000,
      yearLevels: ['Post Matric'],
      requiredDocuments: ['Residence Certificate', 'Caste Certificate', 'Income Certificate'],
      description: 'Support for Bihar students pursuing studies after matriculation.',
    }
  ]
  await Scholarship.insertMany(samples)

  console.log('Seed complete: created admin and sample scholarships')
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
