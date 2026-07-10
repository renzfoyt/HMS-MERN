import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { Admin } from "../models/Admin.js";

dotenv.config();

// 👇 Change these before running
const USERNAME = "admin";
const PASSWORD = "admin123";  //change in production

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