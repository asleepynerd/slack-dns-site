import mongoose from "mongoose";

interface ICDNFile {
  userId: string;
  slackId: string;
  key: string;
  filename: string;
  contentType: string;
  size: number;
  createdAt: Date;
  lastModified: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  mimeType: string;
  extension: string;
  hash?: string;
  views: number;
  lastViewed?: Date;
  bandwidth: number;
}

const cdnFileSchema = new mongoose.Schema<ICDNFile>({
  userId: { type: String, required: true },
  slackId: { type: String, required: true },
  key: { type: String, required: true, unique: true },
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
  size: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  lastModified: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  mimeType: { type: String, required: true },
  extension: { type: String, required: true },
  hash: { type: String },
  views: { type: Number, default: 0 },
  lastViewed: { type: Date },
  bandwidth: { type: Number, default: 0 }, // Total bytes transferred
});

// Create indexes for common queries
cdnFileSchema.index({ userId: 1, isDeleted: 1 });
cdnFileSchema.index({ slackId: 1, isDeleted: 1 });
cdnFileSchema.index({ key: 1 }, { unique: true });
cdnFileSchema.index({ hash: 1 });
cdnFileSchema.index({ extension: 1 });
cdnFileSchema.index({ mimeType: 1 });

// Virtual for the full URL
cdnFileSchema.virtual("url").get(function () {
  return `https://cdn.hack.pet/${this.key}`;
});

// Method to soft delete a file
cdnFileSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
};

// Method to track a view
cdnFileSchema.methods.trackView = async function (bytes: number) {
  this.views += 1;
  this.lastViewed = new Date();
  this.bandwidth += bytes;
  await this.save();
};

// Static method to get active files for a user
cdnFileSchema.statics.getActiveFiles = async function (userId: string) {
  return this.find({
    userId,
    isDeleted: false,
  }).sort({ lastModified: -1 });
};

// Static method to get file by key
cdnFileSchema.statics.getByKey = async function (key: string) {
  return this.findOne({
    key,
    isDeleted: false,
  });
};

// Static method to get popular files
cdnFileSchema.statics.getPopularFiles = async function (limit = 10) {
  return this.find({
    isDeleted: false,
  })
    .sort({ views: -1 })
    .limit(limit);
};

// Static method to get total storage used by user
cdnFileSchema.statics.getUserStorageUsed = async function (userId: string) {
  const result = await this.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: null,
        totalSize: { $sum: "$size" },
        totalBandwidth: { $sum: "$bandwidth" },
        fileCount: { $sum: 1 },
      },
    },
  ]);
  return result[0] || { totalSize: 0, totalBandwidth: 0, fileCount: 0 };
};

export const CDNFile =
  mongoose.models.CDNFile || mongoose.model<ICDNFile>("CDNFile", cdnFileSchema);
