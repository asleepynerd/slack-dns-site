import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  messageId: String,
  inboxId: String,
  from: String,
  to: String,
  subject: String,
  body: String,
  html: String,
  read: { type: Boolean, default: false },
  sent: { type: Boolean, default: false },
  attachments: [{
    filename: String,
    contentType: String,
    size: Number,
    url: String
  }],
  createdAt: { type: Date, default: Date.now },
});

const InboxSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  allowedSenders: [String],
  createdAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

export const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);
export const Inbox = mongoose.models.Inbox || mongoose.model("Inbox", InboxSchema);
