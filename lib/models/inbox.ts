import mongoose from "mongoose";

const inboxSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
  lastChecked: { type: Date },
});

const messageSchema = new mongoose.Schema({
  inboxId: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  subject: { type: String },
  body: { type: String },
  html: { type: String },
  folder: { type: String, default: "inbox" },
  sent: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  attachments: [
    {
      filename: String,
      contentType: String,
      size: Number,
      url: String,
    },
  ],
  receivedAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

inboxSchema.pre("save", function (next) {
  if (this.email && !this.address) {
    this.address = this.email;
  }
  if (this.address && !this.email) {
    this.email = this.address;
  }
  next();
});

messageSchema.index({ inboxId: 1, folder: 1, createdAt: -1 });
messageSchema.index({ inboxId: 1, createdAt: -1 });

export const Inbox =
  mongoose.models.Inbox || mongoose.model("Inbox", inboxSchema);
export const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
