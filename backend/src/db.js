import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export function connect() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarbridge';
  return mongoose.connect(uri, { autoIndex: true });
}
