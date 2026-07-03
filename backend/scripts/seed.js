import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";
import bcrypt from "bcrypt";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/scholarbridge";

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to DB");

  await User.deleteMany({});

  const adminPass = await bcrypt.hash("adminpass", 10);
  await User.create({
    name: "Admin",
    email: "admin@example.com",
    password: adminPass,
    role: "admin",
  });
  const userPass = await bcrypt.hash("studentpass", 10);
  await User.create({
    name: "Student",
    email: "student@example.com",
    password: userPass,
    role: "student",
  });

  console.log(
    "Seed complete: created admin and student accounts. Scholarship seeding is now admin-driven.",
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
