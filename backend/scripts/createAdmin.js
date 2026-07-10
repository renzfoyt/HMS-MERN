import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { Admin } from "../models/Admin.js";

dotenv.config();

// Usage: node scripts/createAdmin.js <username> <password>
const [USERNAME, PASSWORD] = process.argv.slice(2);

if (!USERNAME || !PASSWORD) {
  console.error("Usage: node scripts/createAdmin.js <username> <password>");
  process.exit(1);
}

if (PASSWORD.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const existing = await Admin.findOne({ username: USERNAME });
    if (existing) {
      console.log(`Admin "${USERNAME}" already exists. Aborting.`);
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    const newAdmin = new Admin({
      username: USERNAME,
      password: hashedPassword,
    });

    await newAdmin.save();
    console.log(`Admin account "${USERNAME}" created successfully.`);
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();