import express from "express";
import cors from "cors";
import helmet from "helmet";
import formRoutes from "./routes/formRoutes.js";
import rateLimiter from "./middleware/rateLimiter.js";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

// Builds and returns the Express app WITHOUT connecting to Mongo or
// starting a listener. Kept separate from server.js so tests can import
// this directly (via supertest) without needing a real DB/Redis connection.
export const createApp = () => {
  const app = express();

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : ["http://localhost:5173", "http://localhost:5174"];

  //middleware
  app.use(helmet());
  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json({ limit: "100kb" }));
  app.use(rateLimiter); // Apply the rate limiter middleware to all routes
  //api
  app.use("/api", formRoutes);
  app.use("/api/auth", authRoutes); // Add the auth routes
  app.use("/api", doctorRoutes);

  // Must come after all routes: catches unmatched routes, then unhandled errors
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp;