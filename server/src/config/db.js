import mongoose from "mongoose";
import { logError, logStatus } from "../utils/logger.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logStatus("DB", `MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logError("DB", "Connection failed", error);
    process.exit(1);
  }
};
