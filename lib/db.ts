import mongoose from "mongoose";
import clientPromise from "./mongodb";

export async function connectDB() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await Promise.race([
        clientPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("DB Connection timeout")), 5000)
        ),
      ]);
    }
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}
