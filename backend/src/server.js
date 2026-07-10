import express from "express";
import cors from "cors";
import formRoutes from "./routes/formRoutes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import rateLimiter from "./middleware/rateLimiter.js";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


//middleware
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"] }));  
app.use(express.json()); 
app.use(rateLimiter); // Apply the rate limiter middleware to all routes
//api
app.use("/api", formRoutes);
app.use("/api/auth", authRoutes); // Add the auth routes
app.use("/api", doctorRoutes);

// Must come after all routes: catches unmatched routes, then unhandled errors
app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
  });
})