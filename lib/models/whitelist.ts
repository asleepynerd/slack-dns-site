import mongoose from "mongoose";

interface IWhitelist {
  userId: string;
  slackUserId: string;
  status: "pending" | "approved" | "denied";
  requestedAt: Date;
  decidedAt?: Date;
  decidedBy?: string;
  lastRequestAt: Date;
  quizCompletedAt?: Date;
}

interface WhitelistModel extends mongoose.Model<IWhitelist> {
  cleanupOldRequests(): Promise<void>;
  canMakeNewRequest(userId: string): Promise<boolean>;
}

const WhitelistSchema = new mongoose.Schema<IWhitelist>({
  userId: { type: String, required: true, unique: true },
  slackUserId: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "denied"],
    default: "pending",
  },
  requestedAt: { type: Date, default: Date.now },
  decidedAt: Date,
  decidedBy: String,
  lastRequestAt: { type: Date, default: Date.now },
  quizCompletedAt: Date,
});

WhitelistSchema.index({ userId: 1, status: 1 });
WhitelistSchema.index({ status: 1, decidedAt: 1 });

WhitelistSchema.statics.cleanupOldRequests = async function () {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  await this.deleteMany({
    status: "denied",
    decidedAt: { $lt: thirtyDaysAgo },
  });
};

WhitelistSchema.statics.canMakeNewRequest = async function (userId: string) {
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  const existingRequest = await this.findOne({
    userId,
    lastRequestAt: { $gt: twentyFourHoursAgo },
  });

  return !existingRequest;
};

export const Whitelist =
  (mongoose.models.Whitelist as WhitelistModel) ||
  mongoose.model<IWhitelist, WhitelistModel>("Whitelist", WhitelistSchema);
