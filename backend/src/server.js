import dotenv from "dotenv";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { validateEnv } from "./config/validateEnv.js";

dotenv.config();
validateEnv();

const app = createApp();
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
  });
});