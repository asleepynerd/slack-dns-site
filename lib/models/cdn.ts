import mongoose, { Document, Model } from "mongoose";

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

interface CDNFileDocument extends ICDNFile, Document {
  url: string;
  softDelete(): Promise<void>;
  trackView(bytes: number): Promise<void>;
}

interface CDNFileModel extends Model<CDNFileDocument> {
  getActiveFiles(userId: string): Promise<CDNFileDocument[]>;
  getByKey(key: string): Promise<CDNFileDocument | null>;
  getPopularFiles(limit?: number): Promise<CDNFileDocument[]>;
  getUserStorageUsed(userId: string): Promise<{
    totalSize: number;
    totalBandwidth: number;
    fileCount: number;
  }>;
}

const cdnFileSchema = new mongoose.Schema<CDNFileDocument>({
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
  bandwidth: { type: Number, default: 0 }, 
});

cdnFileSchema.index({ userId: 1, isDeleted: 1 });
cdnFileSchema.index({ slackId: 1, isDeleted: 1 });
cdnFileSchema.index({ key: 1 }, { unique: true });
cdnFileSchema.index({ hash: 1 });
cdnFileSchema.index({ extension: 1 });
cdnFileSchema.index({ mimeType: 1 });

cdnFileSchema.virtual("url").get(function (this: CDNFileDocument) {
  return `https://cdn.hack.pet/${this.key}`;
});

cdnFileSchema.methods.softDelete = async function (this: CDNFileDocument) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
};

cdnFileSchema.methods.trackView = async function (
  this: CDNFileDocument,
  bytes: number
) {
  this.views += 1;
  this.lastViewed = new Date();
  this.bandwidth += bytes;
  await this.save();
};

cdnFileSchema.statics.getActiveFiles = async function (userId: string) {
  return this.find({
    userId,
    isDeleted: false,
  }).sort({ lastModified: -1 });
};

cdnFileSchema.statics.getByKey = async function (key: string) {
  return this.findOne({
    key,
    isDeleted: false,
  });
};

cdnFileSchema.statics.getPopularFiles = async function (limit = 10) {
  return this.find({
    isDeleted: false,
  })
    .sort({ views: -1 })
    .limit(limit);
};

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

export const CDNFile = (mongoose.models.CDNFile ||
  mongoose.model<CDNFileDocument, CDNFileModel>(
    "CDNFile",
    cdnFileSchema
  )) as CDNFileModel;
