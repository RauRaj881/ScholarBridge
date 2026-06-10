import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Scholarship from '../src/models/Scholarship.js'

dotenv.config()
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarbridge'

const states = ['All India','Bihar','Uttar Pradesh','Maharashtra','Karnataka','Tamil Nadu','Delhi']
const courses = ['UG','PG','Diploma','PhD','10+2']
const categories = ['General','OBC','SC','ST','EBC']

function rand(arr){ return arr[Math.floor(Math.random()*arr.length)] }

async function main(){
  await mongoose.connect(MONGODB_URI)
  console.log('DB connected')
  const items = []
  for(let i=1;i<=60;i++){
    const title = `Demo Scholarship ${i}`
    const provider = i%3===0 ? 'National Scholarship Portal' : i%3===1 ? 'State Education Dept' : 'Private Foundation'
    const amount = i%5===0 ? 'Full tuition' : `₹${(5000 + i*100)} `
    const deadline = new Date(Date.now() + (i%40)*24*60*60*1000)
    const doc = {
      title,
      provider,
      amount,
      deadline,
      states: [rand(states)],
      courses: [rand(courses)],
      categories: [rand(categories)],
      incomeLimit: 200000 + (i%10)*10000,
      yearLevels: ['1st Year','2nd Year'],
      requiredDocuments: ['Aadhaar','Marksheet'],
      description: `This is a demo scholarship record number ${i} used for testing and demo purposes.`,
      featured: i%10===0,
      tags: ['demo']
    }
    items.push(doc)
  }

  await Scholarship.insertMany(items)
  console.log('Inserted', items.length)
  process.exit(0)
}

main().catch(e=>{ console.error(e); process.exit(1) })
