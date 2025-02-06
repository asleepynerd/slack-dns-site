import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  feedback: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
  userAgent: String,
  path: String,
});

export const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema); 