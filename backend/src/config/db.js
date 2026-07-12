import mongoose from "mongoose";
import { logger } from "./logger.js";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
         logger.info("MongoDB connected successfully");
    } catch (error) {
         logger.error({ err: error }, "MongoDB connection failed");
         process.exit(1); // Exit the process with failure
    }
};