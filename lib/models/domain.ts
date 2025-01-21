import mongoose from "mongoose";
import { toast } from "@/hooks/use-toast";

const DomainRecordSchema = new mongoose.Schema({
  domain: String,
  recordType: String,
  content: String,
  priority: Number,
  port: Number,
  service: String,  
  protocol: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const DomainSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    domains: [DomainRecordSchema],
  },
  {
    timestamps: true,
    strict: false,
  }
);

mongoose.connection.once("open", () => {
  console.log("MongoDB connected successfully");
});

export const Domain =
  mongoose.models.Domain || mongoose.model("Domain", DomainSchema);
