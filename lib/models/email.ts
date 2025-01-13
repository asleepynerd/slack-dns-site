import mongoose from "mongoose";

const EmailForwardingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  forwarding: [
    {
      fromEmail: String,
      toEmail: String,
      domain: String,
      ruleId: String,
      destinationId: String,
      status: {
        type: String,
        enum: ["pending", "active"],
        default: "pending",
      },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
});

export const EmailForwarding =
  mongoose.models.EmailForwarding ||
  mongoose.model("EmailForwarding", EmailForwardingSchema);
