import mongoose from "mongoose";

interface ILink {
  userId: string;
  shortCode: string;
  destination: string;
  createdAt: Date;
  clicks: number;
  lastClickedAt?: Date;
}

const linkSchema = new mongoose.Schema<ILink>({
  userId: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  destination: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  clicks: { type: Number, default: 0 },
  lastClickedAt: { type: Date },
});

linkSchema.index({ userId: 1, createdAt: -1 });
linkSchema.index({ shortCode: 1 }, { unique: true });

export const Link = mongoose.models.Link || mongoose.model("Link", linkSchema);
